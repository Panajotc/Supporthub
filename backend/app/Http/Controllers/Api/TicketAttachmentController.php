<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TicketAttachmentResource;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketAttachmentController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('view', $ticket);

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:5120',
                'mimes:jpg,jpeg,png,gif,webp,pdf,txt,log',
            ],
        ]);

        $file = $validated['file'];
        $path = $file->store('ticket-attachments', 'public');

        $attachment = TicketAttachment::query()->create([
            'ticket_id' => $ticket->id,
            'uploaded_by' => $request->user()->id,
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => basename($path),
            'path' => $path,
            'mime_type' => $file->getClientMimeType() ?? 'application/octet-stream',
            'size' => $file->getSize(),
        ]);

        $attachment->load('uploader');

        return response()->json([
            'message' => 'Attachment uploaded successfully.',
            'attachment' => new TicketAttachmentResource($attachment),
        ], 201);
    }
}