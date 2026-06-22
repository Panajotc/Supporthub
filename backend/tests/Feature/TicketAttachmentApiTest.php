<?php

namespace Tests\Feature;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TicketAttachmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_upload_attachment_to_own_ticket(): void
    {
        Storage::fake('public');

        $customer = $this->createUser(UserRole::Customer);
        $ticket = $this->createTicket($customer);

        $file = UploadedFile::fake()->create('error-log.txt', 12, 'text/plain');

        $response = $this
            ->withTokenFor($customer)
            ->postJson('/api/tickets/' . $ticket->id . '/attachments', [
                'file' => $file,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Attachment uploaded successfully.');
        $response->assertJsonPath('attachment.original_name', 'error-log.txt');

        $this->assertDatabaseHas('ticket_attachments', [
            'ticket_id' => $ticket->id,
            'uploaded_by' => $customer->id,
            'original_name' => 'error-log.txt',
            'mime_type' => 'text/plain',
        ]);

        $storedPath = $response->json('attachment.url');

        $this->assertNotNull($storedPath);
    }

    public function test_customer_cannot_upload_attachment_to_another_customers_ticket(): void
    {
        Storage::fake('public');

        $owner = $this->createUser(UserRole::Customer);
        $otherCustomer = $this->createUser(UserRole::Customer);
        $ticket = $this->createTicket($owner);

        $file = UploadedFile::fake()->create('private-note.txt', 8, 'text/plain');

        $response = $this
            ->withTokenFor($otherCustomer)
            ->postJson('/api/tickets/' . $ticket->id . '/attachments', [
                'file' => $file,
            ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('ticket_attachments', [
            'ticket_id' => $ticket->id,
            'uploaded_by' => $otherCustomer->id,
            'original_name' => 'private-note.txt',
        ]);
    }

    public function test_agent_can_upload_attachment_to_any_ticket(): void
    {
        Storage::fake('public');

        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);
        $ticket = $this->createTicket($customer, [
            'assigned_agent_id' => $agent->id,
        ]);

        $file = UploadedFile::fake()->create('screenshot.png', 20, 'image/png');

        $response = $this
            ->withTokenFor($agent)
            ->postJson('/api/tickets/' . $ticket->id . '/attachments', [
                'file' => $file,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('attachment.original_name', 'screenshot.png');

        $this->assertDatabaseHas('ticket_attachments', [
            'ticket_id' => $ticket->id,
            'uploaded_by' => $agent->id,
            'original_name' => 'screenshot.png',
            'mime_type' => 'image/png',
        ]);
    }

    public function test_attachment_is_included_in_ticket_detail(): void
    {
        Storage::fake('public');

        $customer = $this->createUser(UserRole::Customer);
        $ticket = $this->createTicket($customer);

        $file = UploadedFile::fake()->create('details.pdf', 16, 'application/pdf');

        $this
            ->withTokenFor($customer)
            ->postJson('/api/tickets/' . $ticket->id . '/attachments', [
                'file' => $file,
            ])
            ->assertCreated();

        $response = $this
            ->withTokenFor($customer)
            ->getJson('/api/tickets/' . $ticket->id);

        $response->assertOk();
        $response->assertJsonPath('data.attachments.0.original_name', 'details.pdf');
        $response->assertJsonPath('data.attachments.0.uploaded_by.id', $customer->id);
    }

    private function createUser(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role,
        ]);
    }

    private function createTicket(User $customer, array $overrides = []): Ticket
    {
        return Ticket::factory()->create(array_merge([
            'customer_id' => $customer->id,
            'created_by' => $customer->id,
            'status' => TicketStatus::Open,
            'priority' => TicketPriority::Medium,
        ], $overrides));
    }

    private function withTokenFor(User $user)
    {
        return $this->withHeader(
            'Authorization',
            'Bearer ' . $user->createToken('test-token')->plainTextToken
        );
    }
}