<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Http\Resources\UserResource;

class AgentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        abort_if($user->role === UserRole::Customer, 403, 'This action is unauthorized.');

        $agents = User::query()
            ->where('role', UserRole::Agent->value)
            ->orderBy('name')
            ->get();

        return UserResource::collection($agents);
    }
}