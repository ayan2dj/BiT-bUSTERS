# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CryptoWipe is a client-side web application demonstrating secure data erasure using cryptographic techniques. It's built with vanilla HTML, CSS, and JavaScript, running entirely in the browser without requiring server-side components.

## Architecture

### Page Structure
- **index.html**: Landing page with feature overview and security information
- **erasure.html**: Main application interface for configuring and running data wipe simulations
- **certificate.html**: Certificate display and verification page

### JavaScript Modules
- **main.js**: Landing page animations and scroll behaviors
- **erasure.js**: Core erasure simulation logic, progress tracking, and state management
- **certificate.js**: Certificate generation, QR code rendering, and PDF export functionality

### CSS Structure
- **style.css**: Base styles, typography, components, and responsive design
- **erasure.css**: Specialized styles for the erasure interface
- **certificate.css**: Certificate-specific styling and print layouts

### Key Architecture Patterns

**State Management**: Uses a global `erasureState` object to track progress through different phases (encryption, overwriting, key destruction, verification)

**Multi-step Wizard**: The erasure page implements a step-based wizard pattern (`step-config` → `step-progress` → `step-complete`)

**Simulated Operations**: All cryptographic operations are simulated using `crypto.getRandomValues()` and setTimeout-based progress updates

**Local Storage**: Certificate data is persisted in localStorage for cross-page access

## Development Commands

### Local Development Server
```bash
# Python (if available)
python -m http.server 8000

# Node.js (if available)
npx http-server -p 8000

# Simple file serving
# Open index.html directly in browser for basic functionality
```

### Testing
```bash
# Browser testing across different browsers
start chrome index.html
start firefox index.html  
start msedge index.html

# Or access via localhost if using development server
# http://localhost:8000
```

### File Structure Navigation
- Static assets are in `css/` and `js/` directories
- All HTML files are in the root directory
- No build process required - direct file modification

## Key Implementation Details

### Erasure Process Simulation
The erasure process runs through four phases with different durations:
1. **Encryption** (25% of total time): Simulates AES-256 encryption
2. **Overwriting** (45% of total time): Multiple-pass overwrite simulation  
3. **Key Destruction** (5% of total time): Secure key deletion
4. **Verification** (25% of total time): Confirmation of complete erasure

### Certificate Generation
Certificates are generated with:
- Unique ID using timestamp and random components
- Cryptographic hashes using `crypto.getRandomValues()`
- Digital signatures (simulated)
- QR codes for verification (simplified implementation)

### Progress Tracking
Real-time progress updates occur every 500ms with:
- Overall progress percentage
- Phase-specific progress bars
- Statistics (data processed, throughput, elapsed time)
- Live log generation

### Responsive Design
- Mobile-first approach with breakpoints at 768px and 1024px
- CSS Grid and Flexbox for layouts
- Hardware-accelerated animations using CSS transforms

## Styling Guidelines

### CSS Custom Properties
Key theming variables in `:root`:
```css
--primary-color: #667eea
--secondary-color: #764ba2  
--success-color: #10b981
--danger-color: #ef4444
```

### Animation Performance
- Uses CSS transforms for smooth animations
- Hardware acceleration with `transform` and `opacity`
- Intersection Observer for scroll-triggered animations

## Browser Compatibility

- **Chrome 60+**: Full support (recommended)
- **Firefox 55+**: Full support
- **Safari 11+**: Full support
- **Edge 79+**: Full support (Chromium-based)
- **IE 11**: Not supported (uses modern APIs)

## Security Considerations

- All operations are simulated - no actual data is processed
- Uses Web Crypto API for secure random number generation
- No network requests or data transmission
- localStorage used only for certificate data

## Common Modifications

### Adding New Algorithms
1. Add algorithm card in `erasure.html`
2. Update `getAlgorithmName()` function in `erasure.js`
3. Modify phase durations in `erasureState.phaseData`

### Customizing Progress Phases
Update the `phaseData` array in `erasure.js` with new phases, durations, and icons.

### Styling Changes
Modify CSS custom properties in `style.css` for global theming, or update specific component styles in respective CSS files.
