document.addEventListener('DOMContentLoaded', () => {
    anime({
        targets: '.shape',
        translateX: function() {
            return anime.random(-30, 30) + 'vw';
        },
        translateY: function() {
            return anime.random(-30, 30) + 'vh';
        },
        scale: function() {
            return anime.random(0.5, 1.5);
        },
        duration: 3000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
    });
});