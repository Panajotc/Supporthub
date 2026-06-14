<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\AssignTicketRequest;
use App\Http\Requests\Tickets\StoreTicketRequest;
use App\Http\Requests\Tickets\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ticket::class);

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
        $this->authorize('create', Ticket::class);

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
        $this->authorize('view', $ticket);

        $ticket->load(['customer', 'assignedAgent', 'creator', 'updater', 'replies.user']);

        return new TicketResource($ticket);
    }

    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('updateStatus', $ticket);

        $user = $request->user();

        $oldStatus = $ticket->status;
        $newStatus = TicketStatus::from($request->validated('status'));

        $ticket->status = $newStatus;
        $ticket->updated_by = $user->id;

        if ($newStatus === TicketStatus::Resolved) {
            $ticket->resolved_at = now();
        }

        if ($newStatus === TicketStatus::Closed) {
            $ticket->closed_at = now();
        }

        if ($newStatus !== TicketStatus::Resolved && $newStatus !== TicketStatus::Closed) {
            $ticket->resolved_at = null;
        }

        if ($newStatus !== TicketStatus::Closed) {
            $ticket->closed_at = null;
        }

        $ticket->save();

        TicketStatusHistory::query()->create([
            'ticket_id' => $ticket->id,
            'old_status' => $oldStatus?->value,
            'new_status' => $newStatus->value,
            'changed_by' => $user->id,
        ]);

        $ticket->load(['customer', 'assignedAgent', 'creator', 'updater', 'replies.user']);

        return response()->json([
            'message' => 'Ticket status updated successfully.',
            'ticket' => new TicketResource($ticket),
        ]);
    }

    public function assign(AssignTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('assign', $ticket);

        $user = $request->user();

        $assignedAgent = User::query()->findOrFail($request->validated('assigned_agent_id'));

        if ($assignedAgent->role !== UserRole::Agent) {
            abort(422, 'Tickets can only be assigned to agents.');
        }

        $ticket->assigned_agent_id = $assignedAgent->id;
        $ticket->updated_by = $user->id;
        $ticket->save();

        $ticket->load(['customer', 'assignedAgent', 'creator', 'updater', 'replies.user']);

        return response()->json([
            'message' => 'Ticket assigned successfully.',
            'ticket' => new TicketResource($ticket),
        ]);
    }

    private function generatePublicId(): string
    {
        do {
            $publicId = 'TKT-' . now()->year . '-' . random_int(100000, 999999);
        } while (Ticket::query()->where('public_id', $publicId)->exists());

        return $publicId;
    }
}