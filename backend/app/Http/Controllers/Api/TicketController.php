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
use App\Models\TicketNotification;
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
            ->with(['customer', 'assignedAgent']);

        if ($user->role === UserRole::Customer) {
            $query->where('customer_id', $user->id);
        }

        if ($request->filled('status')) {
            $status = TicketStatus::tryFrom((string) $request->query('status'));

            abort_if($status === null, 422, 'Invalid ticket status.');

            $query->where('status', $status->value);
        }

        if ($request->filled('priority')) {
            $priority = TicketPriority::tryFrom((string) $request->query('priority'));

            abort_if($priority === null, 422, 'Invalid ticket priority.');

            $query->where('priority', $priority->value);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));

            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('public_id', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sort = (string) $request->query('sort', 'newest');

        abort_if(
            ! in_array($sort, ['newest', 'oldest', 'priority_high', 'priority_low'], true),
            422,
            'Invalid ticket sort.'
        );

        match ($sort) {
            'oldest' => $query->orderBy('created_at')->orderBy('id'),
            'priority_high' => $query
                ->orderByRaw(
                    'CASE priority WHEN ? THEN 1 WHEN ? THEN 2 WHEN ? THEN 3 WHEN ? THEN 4 ELSE 5 END',
                    [
                        TicketPriority::Critical->value,
                        TicketPriority::High->value,
                        TicketPriority::Medium->value,
                        TicketPriority::Low->value,
                    ],
                )
                ->latest(),
            'priority_low' => $query
                ->orderByRaw(
                    'CASE priority WHEN ? THEN 1 WHEN ? THEN 2 WHEN ? THEN 3 WHEN ? THEN 4 ELSE 5 END',
                    [
                        TicketPriority::Low->value,
                        TicketPriority::Medium->value,
                        TicketPriority::High->value,
                        TicketPriority::Critical->value,
                    ],
                )
                ->latest(),
            default => $query->latest(),
        };

        return TicketResource::collection($query->paginate(15)->withQueryString());
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

        $ticket->load([
            'customer',
            'assignedAgent',
            'creator',
            'updater',
            'replies.user',
            'statusHistories.changedBy',
        ]);

        return response()->json([
            'message' => 'Ticket created successfully.',
            'ticket' => new TicketResource($ticket),
        ], 201);
    }

    public function show(Request $request, Ticket $ticket): TicketResource
    {
        $this->authorize('view', $ticket);

        $ticket->load([
            'customer',
            'assignedAgent',
            'creator',
            'updater',
            'replies.user',
            'statusHistories.changedBy',
        ]);

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

        $this->notifyCustomer(
            $ticket,
            'status_changed',
            'Ticket ' . $ticket->public_id . ' status changed to ' . $newStatus->value . '.'
        );

        $this->notifyAssignedAgent(
            $ticket,
            'status_changed',
            'Ticket ' . $ticket->public_id . ' status changed to ' . $newStatus->value . '.'
        );

        $ticket->load([
            'customer',
            'assignedAgent',
            'creator',
            'updater',
            'replies.user',
            'statusHistories.changedBy',
        ]);

        return response()->json([
            'message' => 'Ticket status updated successfully.',
            'ticket' => new TicketResource($ticket),
        ]);
    }

    public function assign(AssignTicketRequest $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('assign', $ticket);

        $user = $request->user();
        $assignedAgentId = $request->validated('assigned_agent_id');

        if ($assignedAgentId === null) {
            $ticket->assigned_agent_id = null;
            $ticket->updated_by = $user->id;
            $ticket->save();

            $ticket->load([
                'customer',
                'assignedAgent',
                'creator',
                'updater',
                'replies.user',
                'statusHistories.changedBy',
            ]);

            return response()->json([
                'message' => 'Ticket assigned successfully.',
                'ticket' => new TicketResource($ticket),
            ]);
        }

        $assignedAgent = User::query()->findOrFail($assignedAgentId);

        if ($assignedAgent->role !== UserRole::Agent) {
            abort(422, 'Tickets can only be assigned to agents.');
        }

        $ticket->assigned_agent_id = $assignedAgent->id;
        $ticket->updated_by = $user->id;
        $ticket->save();

        $this->createNotification(
            $assignedAgent->id,
            $ticket,
            'ticket_assigned',
            'Ticket ' . $ticket->public_id . ' was assigned to you.'
        );

        $ticket->load([
            'customer',
            'assignedAgent',
            'creator',
            'updater',
            'replies.user',
            'statusHistories.changedBy',
        ]);

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