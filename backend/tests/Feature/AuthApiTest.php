<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use DatabaseTransactions;

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New Customer',
            'email' => 'new.customer@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('message', 'Registration successful.');
        $response->assertJsonStructure([
            'message',
            'user' => [
                'id',
                'name',
                'email',
                'role',
                'created_at',
                'updated_at',
            ],
            'token',
        ]);
        $response->assertJsonPath('user.role', UserRole::Customer->value);

        $this->assertDatabaseHas('users', [
            'email' => 'new.customer@example.com',
            'role' => UserRole::Customer->value,
        ]);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'login.customer@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::Customer->value,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Login successful.');
        $response->assertJsonStructure([
            'message',
            'user' => [
                'id',
                'name',
                'email',
                'role',
                'created_at',
                'updated_at',
            ],
            'token',
        ]);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'wrong.password@example.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::Customer->value,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_view_me(): void
    {
        $user = User::factory()->create([
            'email' => 'me.customer@example.com',
            'role' => UserRole::Customer->value,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me');

        $response->assertOk();
        $response->assertJsonPath('user.email', $user->email);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'logout.customer@example.com',
            'role' => UserRole::Customer->value,
        ]);

        $newAccessToken = $user->createToken('api-token');
        $plainTextToken = $newAccessToken->plainTextToken;
        $tokenId = $newAccessToken->accessToken->id;

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainTextToken)
            ->postJson('/api/logout');

        $response->assertOk();
        $response->assertJsonPath('message', 'Logout successful.');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);
    }
}