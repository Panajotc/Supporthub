<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\StoreTicketReplyRequest;
use App\Http\Resources\TicketReplyResource;
use App\Models\Ticket;
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

        $reply->load('user');

        return response()->json([
            'message' => 'Reply created successfully.',
            'reply' => new TicketReplyResource($reply),
        ], 201);
    }
}