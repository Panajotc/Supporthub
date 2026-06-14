<?php

namespace Tests\Feature;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_customer_can_list_own_tickets(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $otherCustomer = $this->createUser(UserRole::Customer);

        $ownTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-TEST-OWN',
            'title' => 'Own customer ticket',
        ]);

        $otherTicket = $this->createTicket($otherCustomer, [
            'public_id' => 'TKT-TEST-OTHER',
            'title' => 'Other customer ticket',
        ]);

        $response = $this
            ->withTokenFor($customer)
            ->getJson('/api/tickets');

        $response->assertOk();
        $response->assertJsonFragment([
            'public_id' => $ownTicket->public_id,
        ]);
        $response->assertJsonMissing([
            'public_id' => $otherTicket->public_id,
        ]);
    }

    public function test_customer_can_create_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);

        $response = $this
            ->withTokenFor($customer)
            ->postJson('/api/tickets', [
                'title' => 'API test ticket',
                'description' => 'This ticket was created by an automated test.',
                'priority' => TicketPriority::High->value,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Ticket created successfully.');
        $response->assertJsonPath('ticket.status', TicketStatus::Open->value);
        $response->assertJsonPath('ticket.priority', TicketPriority::High->value);

        $this->assertDatabaseHas('tickets', [
            'title' => 'API test ticket',
            'customer_id' => $customer->id,
            'status' => TicketStatus::Open->value,
            'priority' => TicketPriority::High->value,
        ]);
    }

    public function test_customer_can_view_own_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);

        $ticket = $this->createTicket($customer, [
            'title' => 'Ticket detail test',
        ]);

        $response = $this
            ->withTokenFor($customer)
            ->getJson('/api/tickets/' . $ticket->id);

        $response->assertOk();
        $response->assertJsonPath('data.id', $ticket->id);
        $response->assertJsonPath('data.title', 'Ticket detail test');
    }

    public function test_customer_can_reply_to_own_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $ticket = $this->createTicket($customer);

        $response = $this
            ->withTokenFor($customer)
            ->postJson('/api/tickets/' . $ticket->id . '/replies', [
                'body' => 'This is a test reply.',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Reply created successfully.');
        $response->assertJsonPath('reply.ticket_id', $ticket->id);

        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $customer->id,
            'body' => 'This is a test reply.',
            'is_internal' => false,
        ]);
    }

    public function test_customer_cannot_update_ticket_status(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $ticket = $this->createTicket($customer);

        $response = $this
            ->withTokenFor($customer)
            ->patchJson('/api/tickets/' . $ticket->id . '/status', [
                'status' => TicketStatus::InProgress->value,
            ]);

        $response->assertForbidden();
        $response->assertJsonPath('message', 'Customers cannot update ticket status.');
    }

    public function test_agent_can_update_ticket_status(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);
        $ticket = $this->createTicket($customer);

        $response = $this
            ->withTokenFor($agent)
            ->patchJson('/api/tickets/' . $ticket->id . '/status', [
                'status' => TicketStatus::InProgress->value,
            ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Ticket status updated successfully.');
        $response->assertJsonPath('ticket.status', TicketStatus::InProgress->value);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => TicketStatus::InProgress->value,
            'updated_by' => $agent->id,
        ]);

        $this->assertDatabaseHas('ticket_status_histories', [
            'ticket_id' => $ticket->id,
            'old_status' => TicketStatus::Open->value,
            'new_status' => TicketStatus::InProgress->value,
            'changed_by' => $agent->id,
        ]);
    }

    public function test_customer_cannot_assign_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);
        $ticket = $this->createTicket($customer);

        $response = $this
            ->withTokenFor($customer)
            ->patchJson('/api/tickets/' . $ticket->id . '/assign', [
                'assigned_agent_id' => $agent->id,
            ]);

        $response->assertForbidden();
        $response->assertJsonPath('message', 'Customers cannot assign tickets.');
    }

    public function test_agent_can_assign_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);
        $assignedAgent = $this->createUser(UserRole::Agent);
        $ticket = $this->createTicket($customer);

        $response = $this
            ->withTokenFor($agent)
            ->patchJson('/api/tickets/' . $ticket->id . '/assign', [
                'assigned_agent_id' => $assignedAgent->id,
            ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Ticket assigned successfully.');
        $response->assertJsonPath('ticket.assigned_agent.id', $assignedAgent->id);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'assigned_agent_id' => $assignedAgent->id,
            'updated_by' => $agent->id,
        ]);
    }

    private function createUser(UserRole $role): User
    {
        return User::factory()->create([
            'role' => $role->value,
        ]);
    }

    private function createTicket(User $customer, array $overrides = []): Ticket
    {
        return Ticket::query()->create(array_merge([
            'public_id' => 'TKT-TEST-' . fake()->unique()->numerify('######'),
            'title' => 'Test ticket',
            'description' => 'This is a test ticket.',
            'status' => TicketStatus::Open->value,
            'priority' => TicketPriority::Medium->value,
            'customer_id' => $customer->id,
            'assigned_agent_id' => null,
            'created_by' => $customer->id,
            'updated_by' => null,
            'resolved_at' => null,
            'closed_at' => null,
        ], $overrides));
    }

    private function withTokenFor(User $user): self
    {
        $token = $user->createToken('api-token')->plainTextToken;

        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }
}