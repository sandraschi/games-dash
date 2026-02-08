# Gamepad Support

Arcade games support standard game controllers (Xbox, PlayStation, generic USB/Bluetooth). The browser Gamepad API is used; plug in a controller and it works without configuration.

## Supported Games

| Game | Move | Action | Notes |
|------|------|--------|-------|
| Asteroids | left stick / D-pad | A/X | Left=rotate left, Right=rotate right, Up=thrust |
| Breakout | left stick / D-pad | - | Paddle movement |
| Centipede | D-pad left/right | A | Move bug blaster, shoot |
| Dig Dug | D-pad / left stick | A/X | Pump to inflate enemies |
| Donkey Kong | D-pad / left stick | - | Move and climb ladders |
| Frogger | D-pad / left stick | - | One tile per press |
| Galaga | D-pad left/right | A | Move ship, shoot |
| Joust | D-pad left/right | A | Move, flap wings |
| Pac-Man | D-pad / left stick | - | Change direction |
| Q*bert | D-pad | - | Up=up-left, Right=up-right, Down=down-right, Left=down-left |
| Robotron 2084 | left stick | right stick | Left stick move, right stick shoot direction |
| Space Invaders | D-pad left/right | A | Move, shoot |

## Mapping

- **D-pad / Left stick**: Direction (up, down, left, right)
- **Face buttons (A/X/B/Y)**: Primary action (shoot, pump, flap, etc.)
- **Right stick** (Robotron only): Aim/shoot direction

## Technical

- `js/gamepad-utils.js` provides `GamepadUtils.getGamepadInput()`
- Returns `{ up, down, left, right, action, upLeft, upRight, downLeft, downRight, leftStickX, leftStickY, rightStickX, rightStickY, connected }`
- 0.25 deadzone on sticks
- First connected controller is used
