<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->role === UserRole::Agent || $user->role === UserRole::Admin) {
            return true;
        }

        return $ticket->customer_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function reply(User $user, Ticket $ticket): bool
    {
        if ($user->role === UserRole::Agent || $user->role === UserRole::Admin) {
            return true;
        }

        return $ticket->customer_id === $user->id;
    }

    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::Agent || $user->role === UserRole::Admin;
    }

    public function assign(User $user, Ticket $ticket): bool
    {
        return $user->role === UserRole::Agent || $user->role === UserRole::Admin;
    }

    public function update(User $user, Ticket $ticket): bool
    {
        return false;
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return false;
    }

    public function restore(User $user, Ticket $ticket): bool
    {
        return false;
    }

    public function forceDelete(User $user, Ticket $ticket): bool
    {
        return false;
    }
}