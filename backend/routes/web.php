<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'supporthub-api',
        'message' => 'SupportHub API is running.',
    ]);
});
