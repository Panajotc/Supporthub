<?php

namespace Tests\Feature;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_agent_can_view_dashboard_stats(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);

        $this->createTicket($customer, [
            'status' => TicketStatus::Open,
            'priority' => TicketPriority::High,
            'assigned_agent_id' => $agent->id,
        ]);

        $this->createTicket($customer, [
            'status' => TicketStatus::Closed,
            'priority' => TicketPriority::Medium,
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/dashboard/stats');

        $response->assertOk();
        $response->assertJsonPath('data.open_tickets', 1);
        $response->assertJsonPath('data.closed_tickets', 1);
        $response->assertJsonPath('data.high_priority_tickets', 1);
        $response->assertJsonPath('data.assigned_tickets', 1);
    }

    public function test_customer_dashboard_only_counts_own_tickets(): void
    {
        $customer = $this->createUser(UserRole::Customer);
        $otherCustomer = $this->createUser(UserRole::Customer);
        $agent = $this->createUser(UserRole::Agent);

        $this->createTicket($customer, [
            'status' => TicketStatus::Open,
            'priority' => TicketPriority::Critical,
            'assigned_agent_id' => $agent->id,
        ]);

        $this->createTicket($otherCustomer, [
            'status' => TicketStatus::Open,
            'priority' => TicketPriority::High,
            'assigned_agent_id' => $agent->id,
        ]);

        $response = $this
            ->withTokenFor($customer)
            ->getJson('/api/dashboard/stats');

        $response->assertOk();
        $response->assertJsonPath('data.open_tickets', 1);
        $response->assertJsonPath('data.closed_tickets', 0);
        $response->assertJsonPath('data.high_priority_tickets', 1);
        $response->assertJsonPath('data.assigned_tickets', 1);
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