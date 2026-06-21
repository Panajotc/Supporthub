<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $visibleTicketsQuery = Ticket::query();

        if ($user->role === UserRole::Customer) {
            $visibleTicketsQuery->where('customer_id', $user->id);
        }

        $assignedTicketsQuery = Ticket::query();

        if ($user->role === UserRole::Customer) {
            $assignedTicketsQuery
                ->where('customer_id', $user->id)
                ->whereNotNull('assigned_agent_id');
        } elseif ($user->role === UserRole::Agent) {
            $assignedTicketsQuery->where('assigned_agent_id', $user->id);
        } else {
            $assignedTicketsQuery->whereNotNull('assigned_agent_id');
        }

        return response()->json([
            'data' => [
                'open_tickets' => (clone $visibleTicketsQuery)
                    ->where('status', TicketStatus::Open->value)
                    ->count(),

                'closed_tickets' => (clone $visibleTicketsQuery)
                    ->where('status', TicketStatus::Closed->value)
                    ->count(),

                'high_priority_tickets' => (clone $visibleTicketsQuery)
                    ->whereIn('priority', [
                        TicketPriority::High->value,
                        TicketPriority::Critical->value,
                    ])
                    ->count(),

                'assigned_tickets' => $assignedTicketsQuery->count(),
            ],
        ]);
    }
}