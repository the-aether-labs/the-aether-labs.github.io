/**
 * aether-field.js
 * Bespoke Topographic Vector Field & Harmonic Ambient Aurora Engine
 * Exclusively architected for The Aether Labs.
 * 
 * Features:
 * - Fluid mathematical harmonic contour waves (Gravitational isolines)
 * - Deep volumetric ambient aurora washes (Atmospheric aether glow)
 * - Interactive gravitational lens cursor deflection
 * - Scroll-velocity elevation parallax
 * - Coordinated Dark & Light theme color spaces
 * - Hardware-accelerated 60 FPS rendering with power-saving lifecycle hooks
 */
(function (global) {
    'use strict';

    class AetherField {
        constructor(canvas, options = {}) {
            if (!canvas) return;
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { alpha: false });
            if (!this.ctx) return;

            this.options = Object.assign({
                lineCount: 16,
                stepX: 16,
                speed: 0.35,
                waveHeight: 32,
                cursorRadius: 260,
                cursorForce: 38
            }, options);

            this.width = 0;
            this.height = 0;
            this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            this.time = 0;
            this.lastNow = null;
            this.raf = null;
            this.disposed = false;

            // Interactive state
            this.mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000, active: false };
            this.scrollY = window.scrollY || 0;
            this.scrollVelocity = 0;
            this.lastScrollY = this.scrollY;
            this.lastScrollTime = performance.now();

            // Accessibility & Device capabilities
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.isMobile = window.matchMedia('(pointer: coarse)').matches || (window.innerWidth < 768);
            this.isDark = document.documentElement.classList.contains('dark');

            this.init();
        }

        init() {
            this.handleResize = this.onResize.bind(this);
            this.handlePointerMove = this.onPointerMove.bind(this);
            this.handlePointerLeave = this.onPointerLeave.bind(this);
            this.handleScroll = this.onScroll.bind(this);
            this.handleVisibility = this.onVisibilityChange.bind(this);

            window.addEventListener('resize', this.handleResize, { passive: true });
            window.addEventListener('scroll', this.handleScroll, { passive: true });
            document.addEventListener('visibilitychange', this.handleVisibility);

            if (!this.isMobile) {
                window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
                document.documentElement.addEventListener('pointerleave', this.handlePointerLeave);
            }

            this.onResize();
            this.requestFrame();
        }

        setTheme(isDark) {
            this.isDark = isDark;
        }

        onResize() {
            const rect = this.canvas.getBoundingClientRect();
            this.width = Math.max(1, Math.floor(rect.width));
            this.height = Math.max(1, Math.floor(rect.height));

            this.canvas.width = Math.floor(this.width * this.dpr);
            this.canvas.height = Math.floor(this.height * this.dpr);
            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            this.isMobile = this.width < 768;
            this.activeLineCount = this.isMobile ? 11 : this.options.lineCount;
            this.activeStepX = this.isMobile ? 22 : this.options.stepX;
        }

        onPointerMove(e) {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
            this.mouse.active = true;
        }

        onPointerLeave() {
            this.mouse.active = false;
        }

        onScroll() {
            const now = performance.now();
            const dt = Math.max(1, now - this.lastScrollTime) / 1000;
            const currentY = window.scrollY || 0;
            const dy = currentY - this.lastScrollY;
            const v = Math.abs(dy) / (window.innerHeight || 800) / dt;

            this.scrollVelocity += (v - this.scrollVelocity) * 0.35;
            this.scrollY = currentY;
            this.lastScrollY = currentY;
            this.lastScrollTime = now;
        }

        onVisibilityChange() {
            if (document.visibilityState === 'hidden') {
                if (this.raf) {
                    cancelAnimationFrame(this.raf);
                    this.raf = null;
                }
            } else {
                this.lastNow = performance.now();
                this.requestFrame();
            }
        }

        requestFrame() {
            if (this.disposed || this.raf) return;
            this.raf = requestAnimationFrame(this.render.bind(this));
        }

        render(now) {
            this.raf = null;
            if (this.disposed) return;

            if (!this.lastNow) this.lastNow = now;
            const dt = Math.min((now - this.lastNow) / 1000, 0.1);
            this.lastNow = now;

            if (!this.reducedMotion) {
                this.time += dt * this.options.speed;
            }

            // Smooth pointer easing
            if (this.mouse.active) {
                this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.15;
                this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.15;
            } else {
                this.mouse.x += (-2000 - this.mouse.x) * 0.08;
                this.mouse.y += (-2000 - this.mouse.y) * 0.08;
            }

            // Decay scroll velocity smoothly
            this.scrollVelocity *= Math.pow(0.92, dt * 60);

            this.draw();

            this.requestFrame();
        }

        draw() {
            const ctx = this.ctx;
            const w = this.width;
            const h = this.height;

            // 1. Solid canvas ground
            const bgColor = this.isDark ? '#08080C' : '#F7F9FC';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, w, h);

            // 2. Volumetric Ambient Aether Auroras (Soft, breathing light clouds)
            this.drawAmbientAuroras(ctx, w, h);

            // 3. Mathematical Topographic Wave Lattice
            this.drawTopographicLattice(ctx, w, h);

            // 4. Precision Architectural Corner Crosshairs
            this.drawArchitecturalMarks(ctx, w, h);
        }

        drawAmbientAuroras(ctx, w, h) {
            const t = this.time * 0.5;

            // Aurora 1: Top-Center Focal Wash (Behind executive hero)
            const cx1 = w * 0.5 + Math.sin(t * 0.3) * 60;
            const cy1 = h * 0.15 + Math.cos(t * 0.25) * 40;
            const r1 = Math.max(380, w * 0.45);
            const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, r1);
            if (this.isDark) {
                grad1.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
                grad1.addColorStop(0.5, 'rgba(79, 70, 229, 0.045)');
                grad1.addColorStop(1, 'rgba(8, 8, 12, 0)');
            } else {
                grad1.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
                grad1.addColorStop(0.5, 'rgba(165, 180, 252, 0.03)');
                grad1.addColorStop(1, 'rgba(247, 249, 252, 0)');
            }
            ctx.fillStyle = grad1;
            ctx.fillRect(0, 0, w, h);

            // Aurora 2: Middle-Right Cyan / Emerald Pulse (Autonomous AI resonance)
            const cx2 = w * 0.85 + Math.cos(t * 0.4) * 50;
            const cy2 = h * 0.55 + Math.sin(t * 0.35) * 60;
            const r2 = Math.max(320, w * 0.38);
            const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
            if (this.isDark) {
                grad2.addColorStop(0, 'rgba(16, 185, 129, 0.065)');
                grad2.addColorStop(0.6, 'rgba(6, 95, 70, 0.015)');
                grad2.addColorStop(1, 'rgba(8, 8, 12, 0)');
            } else {
                grad2.addColorStop(0, 'rgba(16, 185, 129, 0.045)');
                grad2.addColorStop(0.6, 'rgba(110, 231, 183, 0.01)');
                grad2.addColorStop(1, 'rgba(247, 249, 252, 0)');
            }
            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, w, h);

            // Aurora 3: Lower-Left Deep Violet Glow (Cognitive vault depth)
            const cx3 = w * 0.15 + Math.sin(t * 0.28) * 45;
            const cy3 = h * 0.82 + Math.cos(t * 0.32) * 40;
            const r3 = Math.max(300, w * 0.35);
            const grad3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, r3);
            if (this.isDark) {
                grad3.addColorStop(0, 'rgba(139, 92, 246, 0.075)');
                grad3.addColorStop(0.55, 'rgba(91, 33, 182, 0.02)');
                grad3.addColorStop(1, 'rgba(8, 8, 12, 0)');
            } else {
                grad3.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
                grad3.addColorStop(0.55, 'rgba(196, 181, 253, 0.01)');
                grad3.addColorStop(1, 'rgba(247, 249, 252, 0)');
            }
            ctx.fillStyle = grad3;
            ctx.fillRect(0, 0, w, h);
        }

        drawTopographicLattice(ctx, w, h) {
            const count = this.activeLineCount;
            const stepX = this.activeStepX;
            const baseSpread = h / (count + 1);
            const scrollParallax = (this.scrollY * 0.08) % baseSpread;

            for (let i = 0; i < count; i++) {
                const normIndex = i / (count - 1 || 1);
                // Baseline Y position distributed through viewport
                const baseY = baseSpread * 0.7 + i * baseSpread + scrollParallax;

                // Color formulation
                let strokeColor;
                if (this.isDark) {
                    const alpha = 0.13 - normIndex * 0.055;
                    const r = Math.round(99 + normIndex * 30);
                    const g = Math.round(102 + normIndex * 45);
                    const b = Math.round(241 - normIndex * 20);
                    strokeColor = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
                } else {
                    const alpha = 0.12 - normIndex * 0.05;
                    strokeColor = `rgba(79, 70, 229, ${alpha.toFixed(3)})`;
                }

                ctx.beginPath();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = this.isDark ? 1.15 : 1.0;

                let first = true;
                const waveFreq1 = 0.0019 + i * 0.00015;
                const waveFreq2 = 0.0042 - i * 0.0001;
                const waveAmp = (this.options.waveHeight + i * 1.8) * (1 + Math.min(0.4, this.scrollVelocity * 0.2));

                for (let x = -40; x <= w + 40; x += stepX) {
                    // Harmonic elevation sines
                    const w1 = Math.sin(x * waveFreq1 + this.time * 0.45 + i * 0.38) * waveAmp;
                    const w2 = Math.cos(x * waveFreq2 - this.time * 0.32 + i * 0.25) * (waveAmp * 0.38);
                    const w3 = Math.sin((x + baseY) * 0.0008 + this.time * 0.18) * 14;

                    // Gravitational Lens cursor displacement
                    let cursorOffset = 0;
                    if (this.mouse.active) {
                        const dx = x - this.mouse.x;
                        const dy = baseY - this.mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const radius = this.options.cursorRadius;
                        if (dist < radius) {
                            const falloff = Math.cos((dist / radius) * (Math.PI / 2));
                            cursorOffset = falloff * falloff * this.options.cursorForce * Math.sin(this.time * 1.8 + dist * 0.04);
                        }
                    }

                    const y = baseY + w1 + w2 + w3 + cursorOffset;

                    if (first) {
                        ctx.moveTo(x, y);
                        first = false;
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }
        }

        drawArchitecturalMarks(ctx, w, h) {
            // Subtle, faint coordinate ticks in viewport corners
            const tickColor = this.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(24, 24, 27, 0.1)';
            ctx.strokeStyle = tickColor;
            ctx.lineWidth = 1;

            const margin = 28;
            const len = 7;

            // Top-left crosshair
            ctx.beginPath();
            ctx.moveTo(margin - len, margin); ctx.lineTo(margin + len, margin);
            ctx.moveTo(margin, margin - len); ctx.lineTo(margin, margin + len);
            ctx.stroke();

            // Top-right crosshair
            ctx.beginPath();
            ctx.moveTo(w - margin - len, margin); ctx.lineTo(w - margin + len, margin);
            ctx.moveTo(w - margin, margin - len); ctx.lineTo(w - margin, margin + len);
            ctx.stroke();

            // Bottom-right crosshair
            ctx.beginPath();
            ctx.moveTo(w - margin - len, h - margin); ctx.lineTo(w - margin + len, h - margin);
            ctx.moveTo(w - margin, h - margin - len); ctx.lineTo(w - margin, h - margin + len);
            ctx.stroke();

            // Bottom-left crosshair
            ctx.beginPath();
            ctx.moveTo(margin - len, h - margin); ctx.lineTo(margin + len, h - margin);
            ctx.moveTo(margin, h - margin - len); ctx.lineTo(margin, h - margin + len);
            ctx.stroke();
        }

        dispose() {
            this.disposed = true;
            if (this.raf) cancelAnimationFrame(this.raf);
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('scroll', this.handleScroll);
            document.removeEventListener('visibilitychange', this.handleVisibility);
            if (!this.isMobile) {
                window.removeEventListener('pointermove', this.handlePointerMove);
                document.documentElement.removeEventListener('pointerleave', this.handlePointerLeave);
            }
        }
    }

    global.AetherField = {
        mount: function (canvas, options) {
            return new AetherField(canvas, options);
        }
    };
})(window);
