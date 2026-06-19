<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AgentApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_agent_can_list_agents(): void
    {
        $agent = $this->createUser(UserRole::Agent, [
            'name' => 'Signed In Agent',
            'email' => 'signed-in-agent@example.test',
        ]);

        $listedAgent = $this->createUser(UserRole::Agent, [
            'name' => 'Listed Agent',
            'email' => 'listed-agent@example.test',
        ]);

        $customer = $this->createUser(UserRole::Customer, [
            'name' => 'Customer User',
            'email' => 'customer-user@example.test',
        ]);

        $response = $this
            ->withTokenFor($agent)
            ->getJson('/api/agents');

        $response->assertOk();

        $response->assertJsonFragment([
            'id' => $agent->id,
            'name' => 'Signed In Agent',
            'email' => 'signed-in-agent@example.test',
            'role' => UserRole::Agent->value,
        ]);

        $response->assertJsonFragment([
            'id' => $listedAgent->id,
            'name' => 'Listed Agent',
            'email' => 'listed-agent@example.test',
            'role' => UserRole::Agent->value,
        ]);

        $response->assertJsonMissing([
            'id' => $customer->id,
            'email' => 'customer-user@example.test',
        ]);
    }

    public function test_admin_can_list_agents(): void
    {
        $admin = $this->createUser(UserRole::Admin);
        $agent = $this->createUser(UserRole::Agent, [
            'name' => 'Support Agent',
            'email' => 'support-agent@example.test',
        ]);

        $response = $this
            ->withTokenFor($admin)
            ->getJson('/api/agents');

        $response->assertOk();

        $response->assertJsonFragment([
            'id' => $agent->id,
            'name' => 'Support Agent',
            'email' => 'support-agent@example.test',
            'role' => UserRole::Agent->value,
        ]);
    }

    public function test_customer_cannot_list_agents(): void
    {
        $customer = $this->createUser(UserRole::Customer);

        $response = $this
            ->withTokenFor($customer)
            ->getJson('/api/agents');

        $response->assertForbidden();
        $response->assertJsonPath('message', 'This action is unauthorized.');
    }

    private function createUser(UserRole $role, array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'role' => $role->value,
        ], $overrides));
    }

    private function withTokenFor(User $user): self
    {
        $token = $user->createToken('api-token')->plainTextToken;

        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }
}