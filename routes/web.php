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
use App\Http\Controllers\OnboardingWizardController;

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

// Companion Password Setup (Invited by Primary User)
Route::get('/companion/setup', [TrustedCircleController::class, 'companionSetup'])->name('companion.setup');
Route::post('/companion/setup', [TrustedCircleController::class, 'companionStorePassword'])->name('companion.setup.store');
Route::match(['get', 'post'], '/companion/verify-code', [TrustedCircleController::class, 'verifyInviteCode'])->name('companion.verify-code');

// Authenticated Core Application Routes
Route::middleware(['auth'])->group(function () {
    // 0. Onboarding Wizard (Step 2 Role Calibration)
    Route::get('/onboarding/setup', [OnboardingWizardController::class, 'index'])->name('onboarding.wizard');
    Route::post('/onboarding/setup', [OnboardingWizardController::class, 'store'])->name('onboarding.wizard.store');

    // 1. Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Track & Cycle Engine
    Route::prefix('cycle')->name('cycle.')->group(function () {
        Route::get('/', [CycleController::class, 'index'])->name('index');
        Route::post('/log', [CycleController::class, 'storeLog'])->name('log.store');
        Route::delete('/log/{cycleLog}', [CycleController::class, 'destroyLog'])->name('log.destroy');
        Route::post('/profile', [CycleController::class, 'updateProfile'])->name('profile.update');
        Route::delete('/profile', [CycleController::class, 'destroyProfile'])->name('profile.destroy');
    });

    // 3. Learn & Engage Hub
    Route::prefix('learn')->name('learn.')->group(function () {
        Route::get('/', [LearnController::class, 'index'])->name('index');
        Route::get('/myths-facts', [LearnController::class, 'mythsFacts'])->name('myths');
        Route::get('/article/{slug}', [LearnController::class, 'show'])->name('show');
        Route::post('/progress', [LearnController::class, 'updateProgress'])->name('progress');
        Route::delete('/progress/{resource}', [LearnController::class, 'destroyProgress'])->name('progress.destroy');
        Route::post('/bookmark', [LearnController::class, 'toggleBookmark'])->name('bookmark');
    });

    // 4. Luna AI Assistant
    Route::prefix('luna')->name('luna.')->group(function () {
        Route::get('/', [LunaAiController::class, 'index'])->name('index');
        Route::post('/message', [LunaAiController::class, 'sendMessage'])->name('message');
        Route::delete('/clear', [LunaAiController::class, 'clear'])->name('clear');
        Route::patch('/message/{message}/rate', [LunaAiController::class, 'rateMessage'])->name('message.rate');
    });

    // 5. Support, Emergency Supplies, Map & Sponsorships
    Route::prefix('support')->name('support.')->group(function () {
        Route::get('/', [SupportController::class, 'index'])->name('index');
        Route::get('/request', [SupportController::class, 'requestView'])->name('request');
        Route::post('/request', [SupportController::class, 'storeRequest'])->name('request.store');
        Route::patch('/request/{productRequest}', [SupportController::class, 'updateRequest'])->name('request.update');
        Route::delete('/request/{productRequest}', [SupportController::class, 'destroyRequest'])->name('request.destroy');

        Route::post('/referrals', [SupportController::class, 'storeReferral'])->name('referrals.store');
        Route::patch('/referrals/{referral}', [SupportController::class, 'updateReferral'])->name('referrals.update');
        Route::delete('/referrals/{referral}', [SupportController::class, 'destroyReferral'])->name('referrals.destroy');

        Route::get('/map', [SupportController::class, 'mapView'])->name('map');
        Route::get('/sponsor', [SupportController::class, 'sponsorView'])->name('sponsor');
        Route::post('/sponsor', [SupportController::class, 'storeDonation'])->name('sponsor.store');
        Route::patch('/donations/{donation}', [SupportController::class, 'updateDonation'])->name('sponsor.update');
        Route::delete('/donations/{donation}', [SupportController::class, 'destroyDonation'])->name('sponsor.destroy');

        Route::post('/ticket', [SupportController::class, 'storeTicket'])->name('ticket.store');
        Route::patch('/ticket/{ticket}', [SupportController::class, 'updateTicket'])->name('ticket.update');
        Route::delete('/ticket/{ticket}', [SupportController::class, 'destroyTicket'])->name('ticket.destroy');
    });

    // 6. Community Forums
    Route::prefix('community')->name('community.')->group(function () {
        Route::get('/', [CommunityController::class, 'index'])->name('index');
        Route::post('/posts', [CommunityController::class, 'storePost'])->name('post.store');
        Route::patch('/posts/{post}', [CommunityController::class, 'updatePost'])->name('post.update');
        Route::delete('/posts/{post}', [CommunityController::class, 'destroyPost'])->name('post.destroy');

        Route::post('/posts/{post}/comments', [CommunityController::class, 'storeComment'])->name('comment.store');
        Route::patch('/comments/{comment}', [CommunityController::class, 'updateComment'])->name('comment.update');
        Route::delete('/comments/{comment}', [CommunityController::class, 'destroyComment'])->name('comment.destroy');

        Route::post('/posts/{post}/react', [CommunityController::class, 'react'])->name('react');
    });

    // 7. Trusted Family/Partner Circle
    Route::prefix('trusted-circle')->name('trusted-circle.')->group(function () {
        Route::get('/', [TrustedCircleController::class, 'manage'])->name('manage');
        Route::post('/invite', [TrustedCircleController::class, 'invite'])->name('invite');
        Route::post('/claim', [TrustedCircleController::class, 'claim'])->name('claim');
        Route::post('/requests/{connection}/accept', [TrustedCircleController::class, 'acceptRequest'])->name('request.accept');
        Route::post('/requests/{connection}/decline', [TrustedCircleController::class, 'declineRequest'])->name('request.decline');
        Route::patch('/{connection}/permissions', [TrustedCircleController::class, 'updatePermissions'])->name('permissions');
        Route::delete('/{connection}', [TrustedCircleController::class, 'revoke'])->name('revoke');
        Route::get('/companion', [TrustedCircleController::class, 'companion'])->name('companion');
        Route::patch('/companion/{connection}', [TrustedCircleController::class, 'updateCompanion'])->name('companion.update');
        Route::delete('/companion/{connection}', [TrustedCircleController::class, 'destroyCompanion'])->name('companion.destroy');
    });

    // 8. Profile & Privacy Center
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::patch('/privacy', [ProfileController::class, 'updatePrivacy'])->name('privacy');
        Route::post('/pin', [ProfileController::class, 'updatePin'])->name('pin');
        Route::post('/verify-pin', [ProfileController::class, 'verifyPin'])->name('verify-pin');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // 9. Operational Portals (Partners, Reviewers, Admins)
    Route::prefix('portal')->name('portal.')->group(function () {
        // Community Partners (Schools & NGOs)
        Route::middleware(['role:community_partner,admin'])->group(function () {
            Route::get('/partner', [PortalController::class, 'partnerDashboard'])->name('partner');
            Route::post('/partner/hub', [PortalController::class, 'storeHub'])->name('partner.hub.store');
            Route::patch('/partner/hub/{hub}', [PortalController::class, 'updateHub'])->name('partner.hub.update');
            Route::delete('/partner/hub/{hub}', [PortalController::class, 'destroyHub'])->name('partner.hub.destroy');
            Route::post('/partner/inventory/{hub}', [PortalController::class, 'updateInventory'])->name('partner.inventory');
            Route::post('/partner/fulfill/{productRequest}', [PortalController::class, 'fulfillRequest'])->name('partner.fulfill');

            Route::post('/partner/products', [PortalController::class, 'storeProduct'])->name('partner.products.store');
            Route::patch('/partner/products/{product}', [PortalController::class, 'updateProduct'])->name('partner.products.update');
            Route::delete('/partner/products/{product}', [PortalController::class, 'destroyProduct'])->name('partner.products.destroy');

            Route::post('/partner/resources', [PortalController::class, 'storePartnerResource'])->name('partner.resources.store');
            Route::patch('/partner/resources/{resource}', [PortalController::class, 'updatePartnerResource'])->name('partner.resources.update');
            Route::delete('/partner/resources/{resource}', [PortalController::class, 'destroyPartnerResource'])->name('partner.resources.destroy');
        });

        // Healthcare Professionals
        Route::middleware(['role:health_reviewer,admin'])->group(function () {
            Route::get('/reviewer', [PortalController::class, 'reviewerDashboard'])->name('reviewer');
            Route::post('/reviewer/approve/{resource}', [PortalController::class, 'approveResource'])->name('reviewer.approve');

            Route::post('/reviewer/resources', [PortalController::class, 'storeReviewerResource'])->name('reviewer.resources.store');
            Route::patch('/reviewer/resources/{resource}', [PortalController::class, 'updateReviewerResource'])->name('reviewer.resources.update');
            Route::delete('/reviewer/resources/{resource}', [PortalController::class, 'destroyReviewerResource'])->name('reviewer.resources.destroy');

            Route::post('/reviewer/resources/{resource}/translations', [PortalController::class, 'storeTranslation'])->name('reviewer.translations.store');
            Route::delete('/reviewer/translations/{translation}', [PortalController::class, 'destroyTranslation'])->name('reviewer.translations.destroy');

            Route::post('/reviewer/myths', [PortalController::class, 'storeMyth'])->name('reviewer.myths.store');
            Route::patch('/reviewer/myths/{myth}', [PortalController::class, 'updateMyth'])->name('reviewer.myths.update');
            Route::delete('/reviewer/myths/{myth}', [PortalController::class, 'destroyMyth'])->name('reviewer.myths.destroy');

            Route::post('/reviewer/chunks', [PortalController::class, 'storeChunk'])->name('reviewer.chunks.store');
            Route::patch('/reviewer/chunks/{chunk}', [PortalController::class, 'updateChunk'])->name('reviewer.chunks.update');
            Route::delete('/reviewer/chunks/{chunk}', [PortalController::class, 'destroyChunk'])->name('reviewer.chunks.destroy');

            Route::patch('/reviewer/referrals/{referral}', [PortalController::class, 'updateReviewerReferral'])->name('reviewer.referrals.update');
            Route::delete('/reviewer/referrals/{referral}', [PortalController::class, 'destroyReviewerReferral'])->name('reviewer.referrals.destroy');
        });

        // Admin Oversight & M&E Analytics
        Route::middleware(['role:admin'])->group(function () {
            Route::get('/admin', [PortalController::class, 'adminDashboard'])->name('admin');

            Route::post('/admin/users', [PortalController::class, 'storeUser'])->name('admin.users.store');
            Route::patch('/admin/users/{user}', [PortalController::class, 'updateUser'])->name('admin.users.update');
            Route::delete('/admin/users/{user}', [PortalController::class, 'destroyUser'])->name('admin.users.destroy');

            Route::post('/admin/hubs', [PortalController::class, 'storeAdminHub'])->name('admin.hubs.store');
            Route::patch('/admin/hubs/{hub}', [PortalController::class, 'updateAdminHub'])->name('admin.hubs.update');
            Route::delete('/admin/hubs/{hub}', [PortalController::class, 'destroyAdminHub'])->name('admin.hubs.destroy');

            Route::post('/admin/campaigns', [PortalController::class, 'storeCampaign'])->name('admin.campaigns.store');
            Route::patch('/admin/campaigns/{campaign}', [PortalController::class, 'updateCampaign'])->name('admin.campaigns.update');
            Route::delete('/admin/campaigns/{campaign}', [PortalController::class, 'destroyCampaign'])->name('admin.campaigns.destroy');

            Route::post('/admin/topics', [PortalController::class, 'storeTopic'])->name('admin.topics.store');
            Route::patch('/admin/topics/{topic}', [PortalController::class, 'updateTopic'])->name('admin.topics.update');
            Route::delete('/admin/topics/{topic}', [PortalController::class, 'destroyTopic'])->name('admin.topics.destroy');

            Route::patch('/admin/posts/{post}/moderate', [PortalController::class, 'moderatePost'])->name('admin.posts.moderate');
            Route::delete('/admin/posts/{post}', [PortalController::class, 'destroyAdminPost'])->name('admin.posts.destroy');

            Route::post('/admin/faqs', [PortalController::class, 'storeFaq'])->name('admin.faqs.store');
            Route::patch('/admin/faqs/{faq}', [PortalController::class, 'updateFaq'])->name('admin.faqs.update');
            Route::delete('/admin/faqs/{faq}', [PortalController::class, 'destroyFaq'])->name('admin.faqs.destroy');

            Route::patch('/admin/tickets/{ticket}', [PortalController::class, 'updateAdminTicket'])->name('admin.tickets.update');
            Route::delete('/admin/tickets/{ticket}', [PortalController::class, 'destroyAdminTicket'])->name('admin.tickets.destroy');

            Route::get('/admin/telemetry/export', [PortalController::class, 'exportTelemetry'])->name('admin.telemetry.export');
        });
    });
});

require __DIR__.'/auth.php';
