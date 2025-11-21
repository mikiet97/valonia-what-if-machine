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
    
    function updateContent(period) {
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
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
});

