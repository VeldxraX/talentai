# PowerShell script to test premium report API
Write-Host "🚀 Testing Premium Report API..." -ForegroundColor Green

try {
    # Step 1: Login
    Write-Host "📝 Step 1: Logging in..." -ForegroundColor Yellow
    $loginData = @{
        email = "petertest@gmail.com"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    
    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Step 2: Get user results
    Write-Host "📊 Step 2: Getting user results..." -ForegroundColor Yellow
    $resultsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/user/results" -Method GET -Headers $headers
    Write-Host "✅ User results fetched!" -ForegroundColor Green
    Write-Host "Results found: $($resultsResponse.results.Count)" -ForegroundColor Cyan
    
    if ($resultsResponse.results.Count -gt 0) {
        $resultId = $resultsResponse.results[0].id
        Write-Host "🔍 Step 3: Testing premium report with Result ID: $resultId" -ForegroundColor Yellow
        
        # Step 3: Get premium report
        $premiumResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/report/premium/$resultId" -Method GET -Headers $headers
        Write-Host "✅ Premium report fetched successfully!" -ForegroundColor Green
        
        # Display results
        Write-Host "=== 📋 PREMIUM REPORT RESULTS ===" -ForegroundColor Magenta
        Write-Host "Top Two Archetypes: $($premiumResponse.topTwoArchetypes.Count) items" -ForegroundColor Cyan
        Write-Host "Career Recommendations: $($premiumResponse.careerRecommendations.Count) items" -ForegroundColor Cyan
        Write-Host "Top Future Buckets: $($premiumResponse.topFutureBuckets.Count) items" -ForegroundColor Cyan
        Write-Host "AI Skill Roadmap: $($premiumResponse.aiSkillRoadmap.Count) items" -ForegroundColor Cyan
        
        if ($premiumResponse.careerRecommendations.Count -gt 0) {
            Write-Host "🎉 SUCCESS: Career recommendations are working!" -ForegroundColor Green
            Write-Host "First career: $($premiumResponse.careerRecommendations[0].title)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ ISSUE: Career recommendations are empty!" -ForegroundColor Red
        }
        
        if ($premiumResponse.topTwoArchetypes.Count -gt 0) {
            Write-Host "🎉 SUCCESS: Top archetypes are working!" -ForegroundColor Green
            Write-Host "First archetype: $($premiumResponse.topTwoArchetypes[0].archetype)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ ISSUE: Top archetypes are empty!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ No results found for user" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
