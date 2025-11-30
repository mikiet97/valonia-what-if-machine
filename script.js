// Timeline Navigation Logic
document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const futureContents = document.querySelectorAll('.future-content');
    const futureTocItems = document.querySelectorAll('.future-toc');
    
    // Timeline period hierarchy (what content shows at each period)
    const periodHierarchy = {
        'present': [],
        '6months': ['6months'],
        '1year': ['6months', '1year'],
        '10years': ['6months', '1year', '10years']
    };
    
    // Talk Points Highlighting on Scroll - Define early so it can be called from updateContent
    function updateTalkPointHighlighting() {
        const allTalkPoints = document.querySelectorAll('.talk-point');
        const triggerZone = window.innerHeight * 0.5; // Middle of viewport (50%)
        const triggerRange = 150; // Range around the trigger zone
        
        // Remove active class from all talk points first
        allTalkPoints.forEach(point => {
            point.classList.remove('active');
        });
        
        // Find the talk point that's currently in the trigger zone
        let bestMatch = null;
        let bestScore = -Infinity;
        
        allTalkPoints.forEach(point => {
            const rect = point.getBoundingClientRect();
            
            // Skip if element is not visible (hidden by display:none or future-content)
            if (rect.height === 0 || rect.width === 0) {
                return;
            }
            
            // Check if element is in the viewport at all
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                return; // Element is completely outside viewport
            }
            
            // Calculate a score for this element
            // Higher score = better candidate
            // Prefer elements closest to the middle of the screen
            let score = 0;
            const elementCenter = rect.top + (rect.height / 2);
            const distanceFromTrigger = Math.abs(elementCenter - triggerZone);
            
            if (distanceFromTrigger <= triggerRange) {
                // Element is near the trigger zone - prefer elements closer to center
                score = triggerRange - distanceFromTrigger;
            } else if (rect.top <= triggerZone && rect.bottom >= triggerZone) {
                // Trigger zone is inside the element - give it a moderate score
                score = triggerRange * 0.5;
            } else if (rect.top < triggerZone && rect.bottom > 0) {
                // Element is above trigger zone but still visible
                score = Math.max(0, (rect.bottom - triggerZone) * 0.3);
            } else if (rect.top > triggerZone && rect.top < triggerZone + triggerRange) {
                // Element is just below trigger zone
                score = (triggerRange - (rect.top - triggerZone)) * 0.3;
            } else {
                // Too far from trigger zone
                return;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = point;
            }
        });
        
        // If we found a match, highlight it
        if (bestMatch) {
            bestMatch.classList.add('active');
        }
    }
    
    function updateContent(period) {
        // Find the current section the user is viewing before updating content
        const currentScrollPosition = window.scrollY;
        let targetSectionId = null;
        
        // Find the closest heading or section that's currently visible
        const allHeadings = document.querySelectorAll('h2, h3, h4');
        for (let i = allHeadings.length - 1; i >= 0; i--) {
            const heading = allHeadings[i];
            const rect = heading.getBoundingClientRect();
            // Check if this heading is in the viewport or just above it
            if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= 0) {
                targetSectionId = heading.id;
                break;
            }
        }
        
        // If no heading found, try to find the closest one to the current scroll position
        if (!targetSectionId) {
            let closestHeading = null;
            let closestDistance = Infinity;
            allHeadings.forEach(heading => {
                const rect = heading.getBoundingClientRect();
                const distance = Math.abs(rect.top);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestHeading = heading;
                }
            });
            if (closestHeading) {
                targetSectionId = closestHeading.id;
            }
        }
        
        // Remove all active states
        timelineItems.forEach(item => item.classList.remove('active'));
        
        // Add active state to selected period
        const selectedItem = document.querySelector(`[data-period="${period}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Hide all future content first
        futureContents.forEach(content => {
            content.classList.remove('visible');
        });
        futureTocItems.forEach(item => {
            item.classList.remove('visible');
        });
        
        // Show content based on period
        const visiblePeriods = periodHierarchy[period] || [];
        visiblePeriods.forEach(visiblePeriod => {
            // Show content sections
            const contentElements = document.querySelectorAll(`[data-appears="${visiblePeriod}"]`);
            contentElements.forEach(element => {
                element.classList.add('visible');
            });
        });
        
        // Update page header subtitle
        updatePageSubtitle(period);
        
        // Scroll to the same section if we found one, otherwise stay at current position
        if (targetSectionId) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                const targetElement = document.getElementById(targetSectionId);
                if (targetElement) {
                    const offset = 100; // Offset from top for better visibility
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    // Update highlighting after scroll
                    setTimeout(updateTalkPointHighlighting, 300);
                }
            });
        } else {
            // If no section found, maintain approximate scroll position
            requestAnimationFrame(() => {
                window.scrollTo({ top: currentScrollPosition, behavior: 'smooth' });
                // Update highlighting after scroll
                setTimeout(updateTalkPointHighlighting, 300);
            });
        }
        
        // Update highlighting after content changes
        setTimeout(updateTalkPointHighlighting, 100);
    }
    
    function updatePageSubtitle(period) {
        const subtitle = document.querySelector('.subtitle');
        const subtitles = {
            'present': 'From The What-If Machine - November 2025',
            '6months': 'From The What-If Machine - May 2026',
            '1year': 'From The What-If Machine - November 2026',
            '10years': 'From The What-If Machine - November 2035'
        };
        
        if (subtitle) {
            subtitle.textContent = subtitles[period] || subtitles['present'];
        }
    }
    
    // Add click handlers to timeline items
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            updateContent(period);
        });
    });
    
    // Initialize with present day
    updateContent('present');
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        const periods = ['present', '6months', '1year', '10years'];
        const currentActive = document.querySelector('.timeline-item.active');
        const currentPeriod = currentActive ? currentActive.getAttribute('data-period') : 'present';
        const currentIndex = periods.indexOf(currentPeriod);
        
        if (e.key === 'ArrowRight' && currentIndex < periods.length - 1) {
            updateContent(periods[currentIndex + 1]);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            updateContent(periods[currentIndex - 1]);
        }
    });
    
    // Use requestAnimationFrame for smooth scrolling updates
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateTalkPointHighlighting();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    updateTalkPointHighlighting();
    
    // Re-check when content visibility changes (timeline updates)
    const observer = new MutationObserver(() => {
        // Small delay to ensure DOM has updated
        setTimeout(updateTalkPointHighlighting, 10);
    });
    
    // Observe changes to future-content visibility
    futureContents.forEach(content => {
        observer.observe(content, { attributes: true, attributeFilter: ['class'] });
    });
});

