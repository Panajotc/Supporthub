<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TicketNotificationResource;
use App\Models\TicketNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketNotificationController extends Controller
{
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $notifications = TicketNotification::query()
            ->with('ticket')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->limit(20)
            ->get();

        return TicketNotificationResource::collection($notifications);
    }
}