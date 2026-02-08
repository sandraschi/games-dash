/**
 * Gamepad API wrapper for games-app.
 * Polls connected gamepads and returns normalized direction + action.
 * Works with Xbox, PlayStation, and generic controllers.
 */

const AXIS_DEADZONE = 0.25;

/**
 * Get current gamepad input from first connected controller.
 * @returns {{ up: boolean, down: boolean, left: boolean, right: boolean, action: boolean, connected: boolean }}
 */
function getGamepadInput() {
    const gp = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = gp[0];
    if (!pad || !pad.connected) {
        return { up: false, down: false, left: false, right: false, action: false, connected: false };
    }

    let up = false;
    let down = false;
    let left = false;
    let right = false;

    if (pad.axes.length >= 2) {
        const lx = pad.axes[0];
        const ly = pad.axes[1];
        if (lx < -AXIS_DEADZONE) left = true;
        if (lx > AXIS_DEADZONE) right = true;
        if (ly < -AXIS_DEADZONE) up = true;
        if (ly > AXIS_DEADZONE) down = true;
    }

    if (pad.buttons.length >= 16) {
        if (pad.buttons[12]?.pressed) up = true;
        if (pad.buttons[13]?.pressed) down = true;
        if (pad.buttons[14]?.pressed) left = true;
        if (pad.buttons[15]?.pressed) right = true;
    }

    const action = pad.buttons[0]?.pressed || pad.buttons[1]?.pressed || pad.buttons[2]?.pressed || pad.buttons[3]?.pressed;

    const upLeft = up && left;
    const upRight = up && right;
    const downLeft = down && left;
    const downRight = down && right;

    let leftStickX = 0;
    let leftStickY = 0;
    let rightStickX = 0;
    let rightStickY = 0;
    if (pad.axes.length >= 2) {
        leftStickX = Math.abs(pad.axes[0]) > AXIS_DEADZONE ? pad.axes[0] : 0;
        leftStickY = Math.abs(pad.axes[1]) > AXIS_DEADZONE ? pad.axes[1] : 0;
    }
    if (pad.axes.length >= 4) {
        rightStickX = Math.abs(pad.axes[2]) > AXIS_DEADZONE ? pad.axes[2] : 0;
        rightStickY = Math.abs(pad.axes[3]) > AXIS_DEADZONE ? pad.axes[3] : 0;
    }

    return {
        up, down, left, right, action, connected: true,
        upLeft, upRight, downLeft, downRight,
        leftStickX, leftStickY, rightStickX, rightStickY
    };
}

/**
 * Check if any gamepad is connected.
 * @returns {boolean}
 */
function hasGamepad() {
    const gp = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gp.length; i++) {
        if (gp[i]?.connected) return true;
    }
    return false;
}

if (typeof window !== 'undefined') {
    window.GamepadUtils = { getGamepadInput, hasGamepad };
}
