function initTooltips() {
    tippy('[title]',{
        placement: 'top',
        animation: 'shift-away',
        delay: [700, 100],
        duration: 100,
        arrow: true,
        dynamicTitle: true
    });
}