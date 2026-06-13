<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Ticket::query()
            ->with(['customer', 'assignedAgent'])
            ->latest();

        if ($user->role === UserRole::Customer) {
            $query->where('customer_id', $user->id);
        }

        return TicketResource::collection($query->paginate(15));
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $user = $request->user();

        $ticket = Ticket::query()->create([
            'public_id' => $this->generatePublicId(),
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'status' => TicketStatus::Open->value,
            'priority' => $request->validated('priority', TicketPriority::Medium->value),
            'customer_id' => $user->id,
            'assigned_agent_id' => null,
            'created_by' => $user->id,
            'updated_by' => null,
        ]);

        TicketStatusHistory::query()->create([
            'ticket_id' => $ticket->id,
            'old_status' => null,
            'new_status' => TicketStatus::Open->value,
            'changed_by' => $user->id,
        ]);

        $ticket->load(['customer', 'assignedAgent', 'creator', 'updater', 'replies.user']);

        return response()->json([
            'message' => 'Ticket created successfully.',
            'ticket' => new TicketResource($ticket),
        ], 201);
    }

    public function show(Request $request, Ticket $ticket): TicketResource
    {
        $user = $request->user();

        if ($user->role === UserRole::Customer && $ticket->customer_id !== $user->id) {
            abort(403, 'You are not allowed to view this ticket.');
        }

        $ticket->load(['customer', 'assignedAgent', 'creator', 'updater', 'replies.user']);

        return new TicketResource($ticket);
    }

    private function generatePublicId(): string
    {
        do {
            $publicId = 'TKT-' . now()->year . '-' . random_int(100000, 999999);
        } while (Ticket::query()->where('public_id', $publicId)->exists());

        return $publicId;
    }
}