<?php

use App\Http\Controllers\Api\TicketAttachmentController;
use App\Http\Controllers\Api\TicketNotificationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AgentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketReplyController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'supporthub-api',
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/tickets/{ticket}/attachments', [TicketAttachmentController::class, 'store']);
    Route::get('/notifications', TicketNotificationController::class);
    Route::get('/agents', [AgentController::class, 'index']);
    Route::get('/dashboard/stats', DashboardController::class);
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
    Route::patch('/tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::patch('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::post('/tickets/{ticket}/replies', [TicketReplyController::class, 'store']);
});