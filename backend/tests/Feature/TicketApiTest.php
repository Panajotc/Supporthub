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

    public function test_agent_can_filter_tickets_by_status(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $openTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-STATUS-OPEN',
            'title' => 'Open ticket',
            'status' => TicketStatus::Open->value,
        ]);

        $resolvedTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-STATUS-RESOLVED',
            'title' => 'Resolved ticket',
            'status' => TicketStatus::Resolved->value,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?status=' . TicketStatus::Open->value);

        $response->assertOk();
        $response->assertJsonFragment([
            'public_id' => $openTicket->public_id,
        ]);
        $response->assertJsonMissing([
            'public_id' => $resolvedTicket->public_id,
        ]);
    }

    public function test_agent_can_filter_tickets_by_priority(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $criticalTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-PRIORITY-CRITICAL',
            'title' => 'Critical priority ticket',
            'priority' => TicketPriority::Critical->value,
        ]);

        $lowTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-PRIORITY-LOW',
            'title' => 'Low priority ticket',
            'priority' => TicketPriority::Low->value,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?priority=' . TicketPriority::Critical->value);

        $response->assertOk();
        $response->assertJsonFragment([
            'public_id' => $criticalTicket->public_id,
        ]);
        $response->assertJsonMissing([
            'public_id' => $lowTicket->public_id,
        ]);
    }

    public function test_agent_can_search_tickets(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $billingTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SEARCH-BILLING',
            'title' => 'Billing problem',
            'description' => 'Customer cannot download invoice.',
        ]);

        $loginTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SEARCH-LOGIN',
            'title' => 'Login problem',
            'description' => 'Customer cannot reset password.',
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?search=billing');

        $response->assertOk();
        $response->assertJsonFragment([
            'public_id' => $billingTicket->public_id,
        ]);
        $response->assertJsonMissing([
            'public_id' => $loginTicket->public_id,
        ]);
    }

    public function test_agent_can_combine_ticket_filters(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $matchingTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-COMBINED-MATCH',
            'title' => 'Billing outage',
            'description' => 'Billing page is unavailable.',
            'status' => TicketStatus::InProgress->value,
            'priority' => TicketPriority::High->value,
        ]);

        $wrongStatusTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-COMBINED-WRONG-STATUS',
            'title' => 'Billing outage',
            'description' => 'Billing page is unavailable.',
            'status' => TicketStatus::Open->value,
            'priority' => TicketPriority::High->value,
        ]);

        $wrongPriorityTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-COMBINED-WRONG-PRIORITY',
            'title' => 'Billing outage',
            'description' => 'Billing page is unavailable.',
            'status' => TicketStatus::InProgress->value,
            'priority' => TicketPriority::Low->value,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson(
                '/api/tickets?search=billing&status=' .
                TicketStatus::InProgress->value .
                '&priority=' .
                TicketPriority::High->value
            );

        $response->assertOk();
        $response->assertJsonFragment([
            'public_id' => $matchingTicket->public_id,
        ]);
        $response->assertJsonMissing([
            'public_id' => $wrongStatusTicket->public_id,
        ]);
        $response->assertJsonMissing([
            'public_id' => $wrongPriorityTicket->public_id,
        ]);
    }

    public function test_agent_can_sort_tickets_by_newest_and_oldest(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $oldTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SORT-OLD',
            'title' => 'Old ticket',
        ]);

        $newTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SORT-NEW',
            'title' => 'New ticket',
        ]);

        $oldTicket->forceFill([
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ])->save();

        $newTicket->forceFill([
            'created_at' => now(),
            'updated_at' => now(),
        ])->save();

        $newestResponse = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?search=TKT-SORT&sort=newest');

        $newestResponse->assertOk();
        $newestResponse->assertJsonPath('data.0.public_id', $newTicket->public_id);

        $oldestResponse = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?search=TKT-SORT&sort=oldest');

        $oldestResponse->assertOk();
        $oldestResponse->assertJsonPath('data.0.public_id', $oldTicket->public_id);
    }

    public function test_agent_can_sort_tickets_by_high_priority_first(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $lowTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SORT-LOW',
            'title' => 'Low priority ticket',
            'priority' => TicketPriority::Low->value,
        ]);

        $criticalTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SORT-CRITICAL',
            'title' => 'Critical priority ticket',
            'priority' => TicketPriority::Critical->value,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?sort=priority_high');

        $response->assertOk();
        $response->assertJsonPath('data.0.public_id', $criticalTicket->public_id);
        $response->assertJsonFragment([
            'public_id' => $lowTicket->public_id,
        ]);
    }

    public function test_agent_can_sort_tickets_by_low_priority_first(): void
    {
        $agent = $this->createUser(UserRole::Agent);
        $customer = $this->createUser(UserRole::Customer);

        $criticalTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SORT-CRITICAL-LOW-FIRST',
            'title' => 'Critical priority ticket',
            'priority' => TicketPriority::Critical->value,
        ]);

        $lowTicket = $this->createTicket($customer, [
            'public_id' => 'TKT-SORT-LOW-FIRST',
            'title' => 'Low priority ticket',
            'priority' => TicketPriority::Low->value,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?sort=priority_low');

        $response->assertOk();
        $response->assertJsonPath('data.0.public_id', $lowTicket->public_id);
        $response->assertJsonFragment([
            'public_id' => $criticalTicket->public_id,
        ]);
    }

    public function test_invalid_ticket_filters_return_validation_error(): void
    {
        $agent = $this->createUser(UserRole::Agent);

        $statusResponse = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?status=not_a_status');

        $statusResponse->assertUnprocessable();
        $statusResponse->assertJsonPath('message', 'Invalid ticket status.');

        $priorityResponse = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?priority=not_a_priority');

        $priorityResponse->assertUnprocessable();
        $priorityResponse->assertJsonPath('message', 'Invalid ticket priority.');

        $sortResponse = $this
            ->withTokenFor($agent)
            ->getJson('/api/tickets?sort=not_a_sort');

        $sortResponse->assertUnprocessable();
        $sortResponse->assertJsonPath('message', 'Invalid ticket sort.');
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

    public function test_customer_cannot_view_another_customers_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $otherCustomer = $this->createUser(UserRole::Customer);

        $ticket = $this->createTicket($otherCustomer, [
            'title' => 'Private ticket owned by another customer',
        ]);

        $response = $this
            ->withTokenFor($customer)
            ->getJson('/api/tickets/' . $ticket->id);

        $response->assertForbidden();
        $response->assertJsonPath('message', 'This action is unauthorized.');
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

    public function test_customer_cannot_reply_to_another_customers_ticket(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $otherCustomer = $this->createUser(UserRole::Customer);

        $ticket = $this->createTicket($otherCustomer);

        $response = $this
            ->withTokenFor($customer)
            ->postJson('/api/tickets/' . $ticket->id . '/replies', [
                'body' => 'Trying to reply to another customer ticket.',
            ]);

        $response->assertForbidden();
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
        $response->assertJsonPath('message', 'This action is unauthorized.');
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
        $response->assertJsonPath('message', 'This action is unauthorized.');
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