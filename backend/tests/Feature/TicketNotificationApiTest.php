<?php

namespace Tests\Feature;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\TicketNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketNotificationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_their_notifications(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);

        $ticket = $this->createTicket($customer, [
            'assigned_agent_id' => $agent->id,
        ]);

        TicketNotification::query()->create([
            'user_id' => $agent->id,
            'ticket_id' => $ticket->id,
            'type' => 'ticket_assigned',
            'message' => 'Ticket ' . $ticket->public_id . ' was assigned to you.',
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/notifications');

        $response->assertOk();
        $response->assertJsonPath('data.0.type', 'ticket_assigned');
        $response->assertJsonPath('data.0.ticket.id', $ticket->id);
        $response->assertJsonPath('data.0.ticket.public_id', $ticket->public_id);
    }

    public function test_assignment_creates_notification_for_assigned_agent(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $admin = $this->createUser(UserRole::Admin);
        $agent = $this->createUser(UserRole::Agent);

        $ticket = $this->createTicket($customer);

        $response = $this
            ->withTokenFor($admin)
            ->patchJson('/api/tickets/' . $ticket->id . '/assign', [
                'assigned_agent_id' => $agent->id,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('ticket_notifications', [
            'user_id' => $agent->id,
            'ticket_id' => $ticket->id,
            'type' => 'ticket_assigned',
        ]);
    }

    public function test_status_change_creates_notification_for_customer(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);

        $ticket = $this->createTicket($customer, [
            'assigned_agent_id' => $agent->id,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->patchJson('/api/tickets/' . $ticket->id . '/status', [
                'status' => TicketStatus::InProgress->value,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('ticket_notifications', [
            'user_id' => $customer->id,
            'ticket_id' => $ticket->id,
            'type' => 'status_changed',
        ]);
    }

    public function test_public_reply_creates_notification_for_customer(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);

        $ticket = $this->createTicket($customer, [
            'assigned_agent_id' => $agent->id,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->postJson('/api/tickets/' . $ticket->id . '/replies', [
                'body' => 'We are checking this now.',
                'is_internal' => false,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('ticket_notifications', [
            'user_id' => $customer->id,
            'ticket_id' => $ticket->id,
            'type' => 'ticket_replied',
        ]);
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