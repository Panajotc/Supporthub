<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\StoreTicketReplyRequest;
use App\Http\Resources\TicketReplyResource;
use App\Models\Ticket;
use App\Models\TicketNotification;
use App\Models\TicketReply;
use Illuminate\Http\JsonResponse;

class TicketReplyController extends Controller
{
    public function store(StoreTicketReplyRequest $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();

        if ($user->role === UserRole::Customer && $ticket->customer_id !== $user->id) {
            abort(403, 'You are not allowed to reply to this ticket.');
        }

        $isInternal = (bool) $request->validated('is_internal', false);

        if ($isInternal && $user->role === UserRole::Customer) {
            abort(403, 'Customers cannot create internal notes.');
        }

        $reply = TicketReply::query()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'body' => $request->validated('body'),
            'is_internal' => $isInternal,
        ]);

        if (! $isInternal) {
            if ($user->role === UserRole::Customer) {
                $this->notifyAssignedAgent(
                    $ticket,
                    'ticket_replied',
                    'Customer replied to ticket ' . $ticket->public_id . '.'
                );
            } else {
                $this->notifyCustomer(
                    $ticket,
                    'ticket_replied',
                    'Support replied to ticket ' . $ticket->public_id . '.'
                );
            }
        }

        $reply->load('user');

        return response()->json([
            'message' => 'Reply created successfully.',
            'reply' => new TicketReplyResource($reply),
        ], 201);
    }

    private function createNotification(
        int $userId,
        Ticket $ticket,
        string $type,
        string $message
    ): void {
        TicketNotification::query()->create([
            'user_id' => $userId,
            'ticket_id' => $ticket->id,
            'type' => $type,
            'message' => $message,
        ]);
    }

    private function notifyCustomer(Ticket $ticket, string $type, string $message): void
    {
        $this->createNotification($ticket->customer_id, $ticket, $type, $message);
    }

    private function notifyAssignedAgent(Ticket $ticket, string $type, string $message): void
    {
        if ($ticket->assigned_agent_id) {
            $this->createNotification($ticket->assigned_agent_id, $ticket, $type, $message);
        }
    }
}