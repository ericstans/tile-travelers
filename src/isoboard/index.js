// --- Animated Text Effect ---
function showAnimatedText(message, options = {}) {
	// Remove any existing animated text
	let existing = document.getElementById('animated-text-effect');
	if (existing) existing.remove();
	const div = document.createElement('div');
	div.id = 'animated-text-effect';
	div.textContent = message;
	div.style.position = 'fixed';
	div.style.left = '50%';
	div.style.top = options.top || '22%';
	div.style.transform = 'translate(-50%, 0) scale(1)';
	div.style.fontSize = options.fontSize || '2.6rem';
	div.style.fontWeight = 'bold';
	div.style.color = options.color || '#f7b300';
	div.style.textShadow = '0 2px 12px #000a, 0 0 2px #fff8';
	div.style.opacity = '0';
	div.style.pointerEvents = 'none';
	div.style.zIndex = 1000;
	div.style.transition = 'opacity 0.25s, transform 0.7s cubic-bezier(.2,1.2,.4,1)';
	document.body.appendChild(div);
	// Animate in
	setTimeout(() => {
		div.style.opacity = '1';
		div.style.transform = 'translate(-50%, 0) scale(1.12)';
	}, 10);
	// Animate out
	setTimeout(() => {
		div.style.opacity = '0';
		div.style.transform = 'translate(-50%, -40px) scale(0.92)';
	}, options.duration || 1400);
	// Remove after animation
	setTimeout(() => {
		if (div.parentNode) div.parentNode.removeChild(div);
	}, (options.duration || 1400) + 600);
}