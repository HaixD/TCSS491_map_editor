# Short-Term Todos
- player controller which ignores all input to play an animation
- maximize use of `Vector` instead of separate `x` and `y` variables
- make camera only follow player horizontally (fixed vertical position)
- dummy enemy (no ai, just takes damage)
- fix documentation
- staircase class which automatically adds a bunch of obstacles
# Long-Term Todos
- attack (skills, combos), dodge, and parry system
- ensure game works with higher quality assets
# Currently Unnecessary Todos
- consider `GameObject.isType(TYPE_ID)`
- consider making some factory/builder class to make top, middle, and bottom colliders
- if the player is the exact height as the bottom boundary of the obstacle above it, jumping causes you to glitch/phase
    - temporary fix is to make player height 0 < x < 1 unit shorter so that it is not visible and collisions aren't triggered
- use map to quickly get all colliders of a certain type
    - use sorted array to quickly find collisions (?)
- some implementation of a slope
    - in a slope, moving horizontally will move in the direction of the slope but this can be overridden by moving vertically
- add bounciness to player controller
- remove `Point` if a replacement is made
- force user to play in full screen (?)
- fix timed events so that things can occur precisely (a bullet cannot despawn in exactly 250ms since it must align with the `deltaTime`)
    - precise update function for `GameObject` and game updates will check if an "interval" is encountered after adding `deltaTime` 
- `SpriteBuilder` class which creates animated sprites from multiple image sources (?)
- particles (?)
- `InstanceVector` (alternative) class which always copies the `x` or/and `y` of another `InstanceVector` maybe with an offset too
# Bugs/Bottlenecks
- calling `getCollisions` with the same collider in the same frame will recompute all collisions
- at high velocities running into a stair causes complete stop
    - this **might** be due to the head/top collider colliding with the stair along with the body
    - this issue only arises with unnaturally high speeds