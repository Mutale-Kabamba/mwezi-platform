<?php

namespace Tests\Feature;

use App\Models\EducationalCategory;
use App\Models\EducationalResource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EducatorWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_anyone_can_apply_to_become_educator_and_unapproved_cannot_create_content(): void
    {
        $user = User::factory()->create(['role' => 'primary_user']);
        $category = EducationalCategory::create([
            'name' => 'Menstrual Health',
            'slug' => 'menstrual-health',
            'description' => 'Core guides',
            'sort_order' => 1,
        ]);

        $this->actingAs($user)
            ->post(route('educator.apply'), [
                'educator_bio' => 'Community health teacher with 5 years experience in Lusaka.',
            ])
            ->assertRedirect();

        $this->assertSame('pending', $user->fresh()->educator_status);

        $this->actingAs($user->fresh())
            ->post(route('educator.resources.store'), [
                'category_id' => $category->id,
                'title' => 'Unauthorized Draft',
                'summary' => 'Should be blocked',
                'body_content' => 'Content body',
                'format' => 'article',
            ])
            ->assertForbidden();
    }

    public function test_admin_and_verified_clinician_can_approve_educator_and_publish_content(): void
    {
        $applicant = User::factory()->create(['role' => 'primary_user']);
        $unverifiedClinician = User::factory()->create([
            'role' => 'health_reviewer',
            'hpcz_verification_status' => 'pending',
        ]);
        $verifiedClinician = User::factory()->create([
            'role' => 'health_reviewer',
            'hpcz_verification_status' => 'verified',
        ]);
        $category = EducationalCategory::create([
            'name' => 'Puberty & Hygiene',
            'slug' => 'puberty-hygiene',
            'description' => 'Youth guides',
            'sort_order' => 1,
        ]);

        // 1. User applies
        $this->actingAs($applicant)->post(route('educator.apply'), [
            'educator_bio' => 'School guidance counselor preparing menstrual hygiene lessons.',
        ])->assertRedirect();

        // 2. Unverified clinician cannot approve educator
        $this->actingAs($unverifiedClinician)
            ->post(route('portal.educators.review', $applicant), ['status' => 'approved'])
            ->assertForbidden();

        // 3. Verified clinician approves educator
        $this->actingAs($verifiedClinician)
            ->post(route('portal.educators.review', $applicant), ['status' => 'approved'])
            ->assertRedirect();

        $this->assertSame('approved', $applicant->fresh()->educator_status);

        // 4. Approved educator creates a lesson with video & quiz (defaults to pending_medical_review)
        $this->actingAs($applicant->fresh())
            ->post(route('educator.resources.store'), [
                'category_id' => $category->id,
                'title' => 'Cycle Basics Video Lesson',
                'summary' => 'Introduction to menstrual health.',
                'body_content' => 'Full lesson notes here.',
                'format' => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'read_time_minutes' => 6,
                'quiz_questions' => [
                    [
                        'question' => 'What is a typical cycle length?',
                        'options' => ['21-35 days', '2 days', '90 days'],
                        'correct_index' => 0,
                        'explanation' => 'Most cycles range from 21 to 35 days.',
                    ],
                ],
            ])
            ->assertRedirect();

        $resource = EducationalResource::where('author_id', $applicant->id)->firstOrFail();
        $this->assertSame('pending_medical_review', $resource->review_status);

        // 5. Approved educator can update their lesson
        $this->actingAs($applicant->fresh())
            ->patch(route('educator.resources.update', $resource), [
                'category_id' => $category->id,
                'title' => 'Cycle Basics Video Lesson Updated',
                'summary' => 'Updated introduction to menstrual health.',
                'body_content' => 'Updated lesson notes here.',
                'format' => 'video',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'read_time_minutes' => 7,
            ])
            ->assertRedirect();

        $this->assertSame('Cycle Basics Video Lesson Updated', $resource->fresh()->title);

        // 6. Admin approves and publishes the content
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)
            ->post(route('portal.reviewer.approve', $resource))
            ->assertRedirect();

        $this->assertSame('approved', $resource->fresh()->review_status);

        // 7. Approved educator can delete their own resource
        $this->actingAs($applicant->fresh())
            ->delete(route('educator.resources.destroy', $resource))
            ->assertRedirect();

        $this->assertDatabaseMissing('educational_resources', ['id' => $resource->id]);
    }
}
