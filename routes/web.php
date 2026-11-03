<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\LearnController;
use App\Http\Controllers\LunaAiController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\TrustedCircleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PortalController;

// Public Onboarding & Splash
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('Onboarding');
})->name('home');

Route::get('/onboarding', function () {
    return Inertia::render('Onboarding');
})->name('onboarding');

// Public Donation Portal Entry & BroadPay Lenco Gateway
Route::get('/sponsor', [SupportController::class, 'sponsorView'])->name('public.sponsor');
Route::post('/sponsor', [SupportController::class, 'storeDonation'])->name('public.sponsor.store');
Route::get('/sponsor/verify/{reference}', [SupportController::class, 'verifyDonationStatus'])->name('public.sponsor.verify');
Route::post('/webhooks/broadpay', [SupportController::class, 'handleBroadPayWebhook'])->name('webhook.broadpay');

// Authenticated Core Application Routes
Route::middleware(['auth'])->group(function () {
    // 1. Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Track & Cycle Engine
    Route::prefix('cycle')->name('cycle.')->group(function () {
        Route::get('/', [CycleController::class, 'index'])->name('index');
        Route::post('/log', [CycleController::class, 'storeLog'])->name('log.store');
        Route::post('/profile', [CycleController::class, 'updateProfile'])->name('profile.update');
    });

    // 3. Learn & Engage Hub
    Route::prefix('learn')->name('learn.')->group(function () {
        Route::get('/', [LearnController::class, 'index'])->name('index');
        Route::get('/myths-facts', [LearnController::class, 'mythsFacts'])->name('myths');
        Route::get('/article/{slug}', [LearnController::class, 'show'])->name('show');
        Route::post('/progress', [LearnController::class, 'updateProgress'])->name('progress');
        Route::post('/bookmark', [LearnController::class, 'toggleBookmark'])->name('bookmark');
    });

    // 4. Luna AI Assistant
    Route::prefix('luna')->name('luna.')->group(function () {
        Route::get('/', [LunaAiController::class, 'index'])->name('index');
        Route::post('/message', [LunaAiController::class, 'sendMessage'])->name('message');
        Route::delete('/clear', [LunaAiController::class, 'clear'])->name('clear');
    });

    // 5. Support, Emergency Supplies, Map & Sponsorships
    Route::prefix('support')->name('support.')->group(function () {
        Route::get('/', [SupportController::class, 'index'])->name('index');
        Route::get('/request', [SupportController::class, 'requestView'])->name('request');
        Route::post('/request', [SupportController::class, 'storeRequest'])->name('request.store');
        Route::get('/map', [SupportController::class, 'mapView'])->name('map');
        Route::get('/sponsor', [SupportController::class, 'sponsorView'])->name('sponsor');
        Route::post('/sponsor', [SupportController::class, 'storeDonation'])->name('sponsor.store');
        Route::post('/ticket', [SupportController::class, 'storeTicket'])->name('ticket.store');
    });

    // 6. Community Forums
    Route::prefix('community')->name('community.')->group(function () {
        Route::get('/', [CommunityController::class, 'index'])->name('index');
        Route::post('/posts', [CommunityController::class, 'storePost'])->name('post.store');
        Route::post('/posts/{post}/comments', [CommunityController::class, 'storeComment'])->name('comment.store');
        Route::post('/posts/{post}/react', [CommunityController::class, 'react'])->name('react');
    });

    // 7. Trusted Family/Partner Circle
    Route::prefix('trusted-circle')->name('trusted-circle.')->group(function () {
        Route::get('/', [TrustedCircleController::class, 'manage'])->name('manage');
        Route::post('/invite', [TrustedCircleController::class, 'invite'])->name('invite');
        Route::patch('/{connection}/permissions', [TrustedCircleController::class, 'updatePermissions'])->name('permissions');
        Route::delete('/{connection}', [TrustedCircleController::class, 'revoke'])->name('revoke');
        Route::get('/companion', [TrustedCircleController::class, 'companion'])->name('companion');
    });

    // 8. Profile & Privacy Center
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::patch('/privacy', [ProfileController::class, 'updatePrivacy'])->name('privacy');
        Route::post('/pin', [ProfileController::class, 'updatePin'])->name('pin');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // 9. Operational Portals (Partners, Reviewers, Admins)
    Route::prefix('portal')->name('portal.')->group(function () {
        // Community Partners (Schools & NGOs)
        Route::get('/partner', [PortalController::class, 'partnerDashboard'])->name('partner');
        Route::post('/partner/inventory/{hub}', [PortalController::class, 'updateInventory'])->name('partner.inventory');
        Route::post('/partner/fulfill/{productRequest}', [PortalController::class, 'fulfillRequest'])->name('partner.fulfill');

        // Healthcare Professionals
        Route::get('/reviewer', [PortalController::class, 'reviewerDashboard'])->name('reviewer');
        Route::post('/reviewer/approve/{resource}', [PortalController::class, 'approveResource'])->name('reviewer.approve');

        // Admin Oversight & M&E Analytics
        Route::get('/admin', [PortalController::class, 'adminDashboard'])->name('admin');
    });
});

require __DIR__.'/auth.php';
