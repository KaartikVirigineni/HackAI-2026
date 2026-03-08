export class Renderer {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  mapConfig: {
    width: number;
    height: number;
    rooms?: {x: number, y: number, w: number, h: number, name: string}[];
    obstacles?: {x: number, y: number, w: number, h: number}[];
    table?: {x: number, y: number, w: number, h: number};
  } | null = null;
  showFullMap: boolean = false;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  // Helper to draw varied shapes for roles
  drawCharacter(x: number, y: number, playerColor: string, isLocal: boolean, isGhost: boolean) {
    this.ctx.save();
    this.ctx.translate(x, y);

    if (isGhost) {
      this.ctx.globalAlpha = 0.4;
    }

    const color = playerColor || '#ffffff';
      
    this.ctx.fillStyle = '#02050a'; // Darker base
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = isLocal ? 10 : 5;

    // Draw shape based on some role traits (or just team for now if role isn't fully mapped)
    this.ctx.beginPath();
    // All players use Hexagon / System Admin shape
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = 15 * Math.cos(angle);
      const py = 15 * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    
    this.ctx.fill();
    this.ctx.stroke();

    // Small glowing center
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.restore();
  }

  render(
    players: Record<string, { x: number, y: number, color: string, isGhost?: boolean, name?: string, tasks?: Record<string, {x: number, y: number, isComplete: boolean, color: string}> }>, 
    localPlayerId: string | null, 
    bodies: {x: number, y: number, id: string}[] = []
  ) {
    // Fill background with black (cyber space)
    this.ctx.fillStyle = '#02050a'; // cyber dark background
    this.ctx.fillRect(0, 0, this.width, this.height);

    const localPlayer = localPlayerId ? players[localPlayerId] : null;
    let camX = 0;
    let camY = 0;

    // Camera follow
    if (localPlayer) {
      camX = localPlayer.x - this.width / 2;
      camY = localPlayer.y - this.height / 2;
      
      // Keep camera within map bounds if mapConfig exists
      if (this.mapConfig) {
        camX = Math.max(0, Math.min(this.mapConfig.width - this.width, camX));
        camY = Math.max(0, Math.min(this.mapConfig.height - this.height, camY));
      }
    }

    this.ctx.save();
    this.ctx.translate(-camX, -camY);

    // Draw Grid (Cyber Terminal feel)
    this.ctx.strokeStyle = '#00f3ff33'; // Cyber blue dim
    this.ctx.lineWidth = 1;
    const mapW = this.mapConfig ? this.mapConfig.width : this.width;
    const mapH = this.mapConfig ? this.mapConfig.height : this.height;

    // Only draw grid spanning the map
    this.ctx.beginPath();
    for (let x = 0; x <= mapW; x += 40) {
      this.ctx.moveTo(x, 0); this.ctx.lineTo(x, mapH);
    }
    for (let y = 0; y <= mapH; y += 40) {
      this.ctx.moveTo(0, y); this.ctx.lineTo(mapW, y);
    }
    this.ctx.stroke();

    // Draw Rooms Floor
    if (this.mapConfig && this.mapConfig.rooms) {
      this.ctx.fillStyle = '#050b14'; // Deep background
      for (const r of this.mapConfig.rooms) {
        this.ctx.fillRect(r.x, r.y, r.w, r.h);
      }
    }

    // Draw Obstacles
    if (this.mapConfig && this.mapConfig.obstacles) {
      this.ctx.fillStyle = '#02050a'; // darker slate
      this.ctx.strokeStyle = '#00f3ff55'; // blue glow line
      this.ctx.lineWidth = 2;
      for (const obs of this.mapConfig.obstacles) {
        this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
        
        // Add some "server" details
        this.ctx.fillStyle = '#111827';
        for(let insetY = obs.y + 10; insetY < obs.y + obs.h - 10; insetY += 20) {
           this.ctx.fillRect(obs.x + 10, insetY, obs.w - 20, 10);
        }
        this.ctx.fillStyle = '#02050a';
      }
    }

    // Draw Table
    if (this.mapConfig && this.mapConfig.table) {
       const {x, y, w, h} = this.mapConfig.table;
       this.ctx.fillStyle = '#050b14'; // cyber table
       this.ctx.fillRect(x, y, w, h);
       this.ctx.strokeStyle = '#00ff66';
       this.ctx.lineWidth = 4;
       this.ctx.strokeRect(x, y, w, h);
    }

    // Draw Room Labels (Drawing after table/obstacles to stay on top)
    if (this.mapConfig && this.mapConfig.rooms) {
      this.ctx.fillStyle = 'rgba(0, 243, 255, 0.25)'; // Faded blue text (slightly more visible)
      this.ctx.font = 'bold 48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      for (const r of this.mapConfig.rooms) {
        this.ctx.fillText(r.name.toUpperCase(), r.x + r.w / 2, r.y + r.h / 2);
      }
      this.ctx.fillStyle = '#050b14'; // reset
    }

    // Draw Bodies
    for (const body of bodies) {
      if (localPlayer) {
        const dx = body.x - localPlayer.x;
        const dy = body.y - localPlayer.y;
        if (Math.sqrt(dx * dx + dy * dy) > 800) continue;
      }
      this.ctx.beginPath();
      this.ctx.rect(body.x - 10, body.y - 10, 20, 20);
      this.ctx.fillStyle = '#6b7280';
      this.ctx.fill();
      this.ctx.strokeStyle = '#374151';
      this.ctx.stroke();

      this.ctx.fillStyle = '#9ca3af';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('COMPROMISED', body.x, body.y - 15);
    }

    // Draw Tasks for local player
    if (localPlayer && localPlayer.tasks && !localPlayer.isGhost) {
      this.ctx.lineWidth = 2;
      for (const [key, t] of Object.entries(localPlayer.tasks)) {
         if (t.isComplete) continue;
         this.ctx.beginPath();
         this.ctx.arc(t.x, t.y, 30, 0, Math.PI * 2);
         this.ctx.fillStyle = `${t.color}40`; // transparent
         this.ctx.fill();
         this.ctx.strokeStyle = t.color;
         this.ctx.stroke();

         this.ctx.fillStyle = '#fff';
         this.ctx.font = 'bold 12px monospace';
         this.ctx.textAlign = 'center';
         this.ctx.fillText(`TASK ${key}`, t.x, t.y + 4);
      }
    }

    // Draw Players
    for (const [id, player] of Object.entries(players)) {
      if (localPlayer && id !== localPlayerId) {
        const dx = player.x - localPlayer.x;
        const dy = player.y - localPlayer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Hide if outside vision
        if (dist > 800) continue;
      }

      this.drawCharacter(player.x, player.y, player.color, id === localPlayerId, player.isGhost ?? false);
      
      // Draw username above player
      this.ctx.fillStyle = '#22c55e';
      this.ctx.font = 'bold 12px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 4;
      const displayName = player.name || 'UNKNOWN';
      this.ctx.fillText(id === localPlayerId ? `${displayName} (YOU)` : displayName, player.x, player.y - 25);
      this.ctx.shadowBlur = 0; // reset
    }

    // Line of Sight masking (Fog of War)
    if (localPlayer && !localPlayer.isGhost) {
      const visionRadius = 900; 
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'; // Dark fog

      this.ctx.beginPath();
      // Outer rect covering the whole map
      this.ctx.rect(0, 0, mapW, mapH);
      // Inner circle (drawn backwards to create a hole)
      this.ctx.arc(localPlayer.x, localPlayer.y, visionRadius, 0, Math.PI * 2, true);
      this.ctx.fill();

      // Soft edge gradient
      const gradient = this.ctx.createRadialGradient(
        localPlayer.x, localPlayer.y, visionRadius * 0.4,
        localPlayer.x, localPlayer.y, visionRadius
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); 
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)'); 

      this.ctx.beginPath();
      this.ctx.arc(localPlayer.x, localPlayer.y, visionRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    }

    this.ctx.restore(); // Restore camera transform

    // --- HUD Overlay: Minimap / Full Map ---
    if (this.mapConfig && localPlayer) {
      const isFull = this.showFullMap;
      const mmSize = isFull ? Math.min(this.width, this.height) * 0.8 : 150;
      const mmMargin = isFull ? 0 : 20;
      const mmX = isFull ? (this.width - mmSize) / 2 : this.width - mmSize - mmMargin;
      const mmY = isFull ? (this.height - mmSize) / 2 : mmMargin;
      
      this.ctx.save();
      // Map Background
      this.ctx.fillStyle = isFull ? 'rgba(5, 11, 20, 0.95)' : 'rgba(2, 5, 10, 0.8)';
      this.ctx.strokeStyle = '#00ff66';
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(mmX, mmY, mmSize, mmSize);
      this.ctx.strokeRect(mmX, mmY, mmSize, mmSize);

      const scaleX = mmSize / this.mapConfig.width;
      const scaleY = mmSize / this.mapConfig.height;

      // Draw rooms and labels
      if (this.mapConfig.rooms) {
         for (const r of this.mapConfig.rooms) {
         this.ctx.fillStyle = isFull ? 'rgba(255, 255, 255, 0.05)' : 'transparent';
         this.ctx.fillRect(mmX + r.x * scaleX, mmY + r.y * scaleY, r.w * scaleX, r.h * scaleY);

         // Labels
         this.ctx.fillStyle = isFull ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
         this.ctx.font = isFull ? 'bold 16px monospace' : 'bold 8px monospace';
         this.ctx.textAlign = 'center';
         this.ctx.textBaseline = 'middle';
         this.ctx.fillText(r.name, mmX + (r.x + r.w / 2) * scaleX, mmY + (r.y + r.h / 2) * scaleY);
         }
      }

      // Draw obstacles on map
      this.ctx.fillStyle = '#02050a';
      if (this.mapConfig.obstacles) {
         for (const obs of this.mapConfig.obstacles) {
            this.ctx.fillRect(mmX + obs.x * scaleX, mmY + obs.y * scaleY, obs.w * scaleX, obs.h * scaleY);
         }
      }
      // Draw tasks on map
      if (localPlayer.tasks && !localPlayer.isGhost && this.mapConfig?.rooms) {
         for (const t of Object.values(localPlayer.tasks)) {
             if (t.isComplete) continue;
             this.ctx.fillStyle = t.color;
             this.ctx.beginPath();
             this.ctx.arc(mmX + t.x * scaleX, mmY + t.y * scaleY, isFull ? 8 : 4, 0, Math.PI * 2);
             this.ctx.fill();
         }
      }

      // Draw local player on map
      this.ctx.fillStyle = localPlayer.color || '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(mmX + localPlayer.x * scaleX, mmY + localPlayer.y * scaleY, isFull ? 6 : 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw camera bounds roughly
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(mmX + camX * scaleX, mmY + camY * scaleY, this.width * scaleX, this.height * scaleY);

      this.ctx.restore();
    }
  }
}
