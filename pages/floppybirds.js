document.addEventListener('DOMContentLoaded', () => {
    const tocButton = document.getElementById('toc-button');
    const tocDropdown = document.getElementById('toc-dropdown');

    tocButton.addEventListener('click', () => {
        tocDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (!tocButton.contains(e.target) && !tocDropdown.contains(e.target)) 
        {
            tocDropdown.classList.remove('show');
        }
    });
});