# GSAP v3 Complete Knowledge Base

**Created**: November 6, 2025  
**Version**: 3.0  
**Purpose**: Comprehensive reference for GSAP animation library with expert-level content and practical examples

---

## Table of Contents

1. [Core Animation Methods](#core-animation-methods)
2. [Timeline Management](#timeline-management)
3. [Advanced Plugins](#advanced-plugins)
4. [Easing Functions](#easing-functions)
5. [Utility Methods](#utility-methods)
6. [Best Practices](#best-practices)
7. [Performance Optimization](#performance-optimization)

---

## Core Animation Methods

### gsap.to()

**Type**: Core Animation Method  
**Description**: Animate FROM current values TO specified values - The most common animation method  
**Syntax**: `gsap.to(targets, vars)`

#### Parameters
- **targets**: String selector, object, or array of elements to animate
- **vars**: Object containing properties to animate and configuration

#### Basic Example
```javascript
gsap.to(".element", { x: 100, duration: 1 })
```

#### Advanced Example
```javascript
gsap.to(".elements", { 
  x: 100, 
  rotation: 360, 
  scale: 1.5, 
  duration: 2, 
  ease: "power3.out", 
  stagger: 0.2 
})
```

#### Complex Example with Custom Easing
```javascript
gsap.to(".element", { 
  css: { 
    transform: "translateX(100px) rotate(45deg)" 
  }, 
  duration: 1.5, 
  ease: CustomEase.create("custom", "M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1 0.37,0.985 0.414,0.961 0.455,0.905 0.51,0.826 0.57,0.73 0.628,0.63 0.709,0.491 0.86,0.413 1,0.413") 
})
```

#### Animatable Properties
x, y, z, rotation, rotationX, rotationY, rotationZ, scale, scaleX, scaleY, scaleZ, opacity, alpha, autoAlpha

#### Performance Tips
- Use transform properties (x, y, scale, rotation) for GPU acceleration
- Set `force3D: true` for complex animations
- Use `will-change` CSS property for optimization

---

### gsap.from()

**Type**: Core Animation Method  
**Description**: Animate FROM specified values TO current values - Perfect for entrance animations  
**Syntax**: `gsap.from(targets, vars)`

#### Entrance Animation
```javascript
gsap.from(".cards", { 
  y: 100, 
  opacity: 0, 
  duration: 1, 
  stagger: 0.2, 
  ease: "power3.out" 
})
```

#### Text Reveal Animation
```javascript
gsap.from(".text", { 
  x: -50, 
  opacity: 0, 
  duration: 0.8, 
  delay: 0.3 
})
```

#### Scale-In Animation
```javascript
gsap.from(".modal", { 
  scale: 0, 
  opacity: 0, 
  duration: 0.5, 
  ease: "back.out(1.7)" 
})
```

#### Key Use Cases
- **Entrance animations** when elements enter the viewport
- **Reveal animations** for dramatic text/image shows
- **Modal/popup entrances** with scale or position
- **Staggered list animations** for multiple elements

---

### gsap.set()

**Type**: Core Animation Method  
**Description**: Immediately set properties without animation - Instant transforms  
**Syntax**: `gsap.set(targets, vars)`

#### Initial State Setup
```javascript
gsap.set(".elements", { 
  x: 0, 
  y: 0, 
  opacity: 1, 
  scale: 1 
})
```

#### Reset Properties
```javascript
gsap.set(".animated", { 
  clearProps: "all" 
})
```

#### Setup Before Animation
```javascript
gsap.set(".cards", { 
  y: 50, 
  opacity: 0, 
  transformOrigin: "center bottom" 
})
```

#### Common Properties to Set
- Position properties (x, y, z)
- Transform properties (scale, rotation, skew)
- Opacity/transparency
- Display properties
- Custom CSS properties

---

## Timeline Management

### gsap.timeline()

**Type**: Core Animation Method  
**Description**: Create powerful animation sequences - The heart of complex animations  
**Syntax**: `gsap.timeline(vars)`

#### Basic Timeline
```javascript
const tl = gsap.timeline();
tl.to(".first", { x: 100 })
  .to(".second", { y: 100 });
```

#### Timeline with Labels
```javascript
const tl = gsap.timeline();
tl.addLabel("start")
  .to(".element", { x: 100 })
  .addLabel("middle")
  .to(".element", { y: 100 });
```

#### Stagger Sequence
```javascript
const tl = gsap.timeline();
tl.from(".cards", { y: 100, opacity: 0, stagger: 0.2 })
  .to(".title", { scale: 1.2 }, "-=0.5");
```

#### Timeline Variables
```javascript
const tl = gsap.timeline({
  repeat: 2,        // Repeat animation 2 times
  yoyo: true,       // Reverse animation
  delay: 0.5,       // Delay before start
  repeatDelay: 1,   // Delay between repeats
  onComplete: () => console.log("Timeline complete!")
});
```

#### Timeline Methods

**add()** - Add tweens or labels
```javascript
tl.add(gsap.to(".element", { x: 100 }), 0);
tl.add("label", 1);
```

**addLabel()** - Add named position markers
```javascript
tl.addLabel("start");
tl.addLabel("middle", 2);
```

**play() / pause() / reverse()** - Control playback
```javascript
tl.play();      // Start from current position
tl.pause();     // Pause animation
tl.reverse();   // Play backwards
tl.restart();   // Start from beginning
```

**seek()** - Jump to specific time or label
```javascript
tl.seek("label");
tl.seek(1.5);     // Jump to 1.5 seconds
```

**progress()** - Get or set animation progress (0-1)
```javascript
tl.progress(0.5); // Set to 50%
console.log(tl.progress()); // Get current progress
```

**time()** - Get or set local time
```javascript
tl.time(2);       // Jump to 2 seconds
console.log(tl.time()); // Get current time
```

**duration()** - Get total duration
```javascript
const duration = tl.duration();
```

---

## Advanced Plugins

### ScrollTrigger

**Type**: Plugin (FREE)  
**Description**: The most powerful scroll-based animation system ever created

#### Core Methods

**ScrollTrigger.create()** - Create individual scroll triggers
```javascript
ScrollTrigger.create({
  trigger: ".section",
  start: "top 80%",
  end: "bottom 20%",
  animation: gsap.from(".element", { y: 100, opacity: 0 }),
  toggleActions: "play none none reverse"
});
```

**ScrollTrigger.batch()** - Batch process multiple elements for performance
```javascript
ScrollTrigger.batch(".fade-in", {
  onEnter: elements => gsap.from(elements, { y: 100, opacity: 0, stagger: 0.1 }),
  onLeave: elements => gsap.to(elements, { opacity: 0.3 }),
  onEnterBack: elements => gsap.to(elements, { opacity: 1 }),
  onLeaveBack: elements => gsap.to(elements, { y: 100, opacity: 0 })
});
```

**ScrollTrigger.refresh()** - Recalculate trigger positions
```javascript
ScrollTrigger.refresh();
```

**ScrollTrigger.update()** - Force update all triggers
```javascript
ScrollTrigger.update();
```

**ScrollTrigger.kill()** - Remove specific triggers
```javascript
const trigger = ScrollTrigger.create({...});
trigger.kill();
```

**ScrollTrigger.killAll()** - Remove all triggers
```javascript
ScrollTrigger.killAll();
```

**ScrollTrigger.getAll()** - Get array of all triggers
```javascript
const triggers = ScrollTrigger.getAll();
```

#### Core Properties

- **trigger**: Element that triggers the animation
- **start**: When animation starts (e.g., "top 80%", "top center")
- **end**: When animation ends (e.g., "bottom 20%", "bottom center")
- **scrub**: Link animation progress to scroll progress (true, 1, or 2)
- **pin**: Pin element during scroll (true or element selector)
- **snap**: Snap to specific scroll positions
- **toggleActions**: Actions for onEnter, onLeave, onEnterBack, onLeaveBack
- **animation**: GSAP animation to control
- **onEnter**: Callback when entering trigger area
- **onLeave**: Callback when leaving trigger area
- **onUpdate**: Callback on every scroll update
- **markers**: Show visual markers for debugging (only in dev)

#### ScrollTrigger Examples

**Basic Scroll Animation**
```javascript
ScrollTrigger.create({
  trigger: ".section",
  start: "top 80%",
  end: "bottom 20%",
  animation: gsap.from(".element", { y: 100, opacity: 0 }),
  toggleActions: "play none none reverse"
});
```

**Scrub Animation (linked to scroll)**
```javascript
gsap.to(".parallax", {
  y: -300,
  scrollTrigger: {
    trigger: ".section",
    start: "top bottom",
    end: "bottom top",
    scrub: 1  // Smooth scrub, 1 = 1 second of lag
  }
});
```

**Pin Section During Scroll**
```javascript
ScrollTrigger.create({
  trigger: ".pin-section",
  start: "top top",
  end: "bottom top",
  pin: true,
  animation: gsap.timeline()
    .to(".pinned-element", { x: 100 })
    .to(".pinned-element", { rotation: 360 })
});
```

**Batch Processing Multiple Elements**
```javascript
ScrollTrigger.batch(".fade-in", {
  onEnter: elements => gsap.from(elements, { 
    y: 100, 
    opacity: 0, 
    stagger: 0.1 
  }),
  onLeave: elements => gsap.to(elements, { opacity: 0.3 }),
  onEnterBack: elements => gsap.to(elements, { opacity: 1 }),
  onLeaveBack: elements => gsap.to(elements, { y: 100, opacity: 0 })
});
```

#### ScrollTrigger Performance Optimization
- Use `ScrollTrigger.batch()` for multiple elements instead of individual triggers
- Set `refreshPriority` for critical triggers
- Use `pin: true` sparingly for better performance
- Combine multiple animations into timelines to reduce overhead
- Avoid complex DOM manipulations in `onUpdate` callbacks

---

## Easing Functions

### Common Eases

**power0** - No easing (linear)
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "power0" });
```

**power1 - power4** - Power eases (power1.in, power1.out, power1.inOut, etc.)
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "power3.out" });
```

**sine** - Smooth sine easing
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "sine.out" });
```

**quad, cubic, quart, quint** - Polynomial eases
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "cubic.inOut" });
```

**expo** - Exponential easing
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "expo.out" });
```

**circ** - Circular easing
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "circ.out" });
```

**back** - Overshoot easing
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "back.out(1.7)" });
```

**elastic** - Elastic easing
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "elastic.out" });
```

**bounce** - Bounce easing
```javascript
gsap.to(".element", { x: 100, duration: 1, ease: "bounce.out" });
```

---

## Utility Methods

### gsap.utils

**clamp()** - Clamp a value between min and max
```javascript
gsap.utils.clamp(0, 100, 150); // Returns 100
gsap.utils.clamp(0, 100, -50); // Returns 0
```

**mapRange()** - Map value from one range to another
```javascript
// Map scroll progress (0-1) to rotation (0-360)
gsap.utils.mapRange(0, 1, 0, 360, 0.5); // Returns 180
```

**normalize()** - Normalize a value (map to 0-1)
```javascript
gsap.utils.normalize(0, 100, 50); // Returns 0.5
```

**random()** - Get random value
```javascript
gsap.utils.random(0, 100);           // Random integer 0-100
gsap.utils.random([10, 20, 30]);     // Random from array
gsap.utils.random(0, 100, 5, true);  // Random multiple of 5
```

**interpolate()** - Interpolate between values
```javascript
const fn = gsap.utils.interpolate(0, 100);
fn(0.5); // Returns 50
```

**toArray()** - Convert selector to array
```javascript
const elements = gsap.utils.toArray(".elements");
elements.forEach(el => console.log(el));
```

**wrap()** - Wrap value within range
```javascript
gsap.utils.wrap(0, 360, 450); // Returns 90
```

**selector()** - Optimized selector
```javascript
const selector = gsap.utils.selector(".container");
const boxes = selector(".boxes"); // Select within container
```

**shuffle()** - Shuffle array
```javascript
const shuffled = gsap.utils.shuffle([1, 2, 3, 4, 5]);
```

**splitColor()** - Split color string to components
```javascript
gsap.utils.splitColor("rgb(255, 100, 50)"); // [255, 100, 50]
```

**getUnit()** - Get unit of value
```javascript
gsap.utils.getUnit("100px");  // "px"
gsap.utils.getUnit("5em");    // "em"
```

**unitize()** - Add unit to value
```javascript
gsap.utils.unitize("px")(100); // "100px"
```

---

## Best Practices

### 1. Use Context for Cleanup

```javascript
const ctx = gsap.context(() => {
  gsap.to(".element", { x: 100, duration: 1 });
  gsap.from(".card", { opacity: 0, duration: 1, stagger: 0.1 });
});

// Cleanup function - revert all animations
return () => ctx.revert();
```

### 2. Avoid Memory Leaks

```javascript
// Bad - animations pile up
function animateOnClick() {
  gsap.to(".element", { x: 100, duration: 1 });
}

// Good - kill previous animation
function animateOnClick() {
  gsap.killTweensOf(".element");
  gsap.to(".element", { x: 100, duration: 1 });
}
```

### 3. Use Stagger for Multiple Elements

```javascript
// Efficient stagger
gsap.from(".items", {
  y: 50,
  opacity: 0,
  duration: 1,
  stagger: 0.1  // 0.1s delay between each element
});
```

### 4. Leverage Position Parameter

```javascript
const tl = gsap.timeline();
tl.to(".element1", { x: 100 })
  .to(".element2", { y: 100 }, "<")        // Start at same time
  .to(".element3", { scale: 2 }, "-=0.5");  // Start 0.5s before last ends
```

### 5. Use Callbacks Wisely

```javascript
gsap.to(".element", {
  x: 100,
  duration: 1,
  onStart: () => console.log("Animation started"),
  onUpdate: () => console.log("Frame update"),
  onComplete: () => console.log("Animation finished"),
  onReverseComplete: () => console.log("Reversed")
});
```

---

## Performance Optimization

### 1. Use Transform Properties

Transform properties (x, y, z, scale, rotation) are GPU-accelerated.

```javascript
// ✅ Good - GPU accelerated
gsap.to(".element", { x: 100, rotation: 45, duration: 1 });

// ❌ Avoid - CPU intensive
gsap.to(".element", { left: "100px", top: "100px", duration: 1 });
```

### 2. Enable Force3D

```javascript
gsap.defaults({ force3D: true });

gsap.to(".element", { x: 100, duration: 1 });
```

### 3. Use Will-Change CSS

```css
.element {
  will-change: transform;
}
```

### 4. Batch Similar Animations

```javascript
// Instead of individual triggers
ScrollTrigger.batch(".item", {
  onEnter: items => gsap.from(items, { y: 50, opacity: 0, stagger: 0.1 })
});
```

### 5. Optimize Callback Functions

```javascript
// ❌ Expensive callback
gsap.to(".element", {
  x: 100,
  duration: 1,
  onUpdate: function() {
    document.querySelector(".counter").textContent = Math.round(this.progress() * 100);
  }
});

// ✅ Optimized with cache
const counter = document.querySelector(".counter");
gsap.to(".element", {
  x: 100,
  duration: 1,
  onUpdate: function() {
    counter.textContent = Math.round(this.progress() * 100);
  }
});
```

### 6. Kill Inactive Tweens

```javascript
// Kill specific tweens
gsap.killTweensOf(".element");

// Kill all tweens of element for specific properties
gsap.killTweensOf(".element", "x,y");
```

### 7. Use Responsive Animations

```javascript
const mm = gsap.matchMedia();

mm.add("(max-width: 768px)", () => {
  return () => {
    // Mobile animations
    gsap.to(".element", { x: 50, duration: 1 });
  };
});

mm.add("(min-width: 769px)", () => {
  return () => {
    // Desktop animations
    gsap.to(".element", { x: 200, duration: 1 });
  };
});
```

---

## Quick Reference

### Animation Methods
- `gsap.to()` - Animate TO values
- `gsap.from()` - Animate FROM values
- `gsap.fromTo()` - Define both FROM and TO
- `gsap.set()` - Set instantly
- `gsap.delayedCall()` - Call function after delay

### Timeline Methods
- `timeline.add()` - Add tween/label
- `timeline.to/from/set()` - Add animation to timeline
- `timeline.play/pause/resume()` - Control playback
- `timeline.seek()` - Jump to position
- `timeline.progress()` - Get/set progress

### Common Properties
- `duration` - Animation length in seconds
- `delay` - Delay before start
- `ease` - Easing function
- `stagger` - Delay between elements
- `repeat` - Number of repeats
- `yoyo` - Reverse animation on repeat
- `onComplete` - Callback when finished

---

**This knowledge base was compiled on November 6, 2025 for the RotaHire project.**

