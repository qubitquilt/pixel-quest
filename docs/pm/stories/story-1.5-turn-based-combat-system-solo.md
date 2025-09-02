# **Story 1.5: Turn-Based Combat System (Solo)**

## **Status**

* \[x\] Draft  
* \[ \] Approved  
* \[ \] InProgress  
* \[ \] Review  
* \[ \] Done

## **Story**

As a player,  
I want to fight enemies in a turn-based system,  
so that I can defeat them using strategy.

## **Acceptance Criteria**

1. On the combat screen, the player's character and the enemy are displayed.  
2. A UI menu appears allowing the player to select "Attack" or "Special Attack".  
3. Selecting "Attack" deals a fixed amount of damage to the enemy.  
4. The enemy retaliates by dealing a fixed amount of damage to the player.  
5. Turns alternate between the player and the enemy until one's health reaches zero.  
6. The "Special Attack" option is present but can be non-functional for this story.  
7. Health for both player and enemy is displayed on screen and updates correctly.

## **Tasks / Subtasks**

* \[ \] Design the layout for the combat screen, showing the player on one side and the enemy on the other.  
* \[ \] Implement health attributes for both the Player and Enemy classes.  
* \[ \] Create a CombatUI component to render the action menu (e.g., "Attack", "Special Attack").  
* \[ \] Add event listeners to the UI menu buttons.  
* \[ \] Implement the turn-based logic:  
  * Player's turn: Enable UI menu.  
  * On "Attack" click, reduce enemy health, then start enemy's turn.  
  * Enemy's turn: Disable UI menu, wait a short duration (e.g., 1 second), reduce player health, then start player's turn.  
* \[ \] Create simple UI elements (e.g., text or bars) to display player and enemy health.  
* \[ \] Add logic to check for health \<= 0 to determine the winner.  
* \[ \] When the battle ends, trigger the existing "end combat" event to transition back to the overworld.

## **Dev Notes**

This completes the core gameplay loop for a single player. This is a client-side simulation of combat; no server interaction is required for this story. The "Special Attack" is a placeholder for now.

### **Architecture Alignment**

* **Combat UI**: This story formalizes the Combat UI frontend component.  
* **Game Logic Engine**: The turn-based state machine is a significant addition to the game's logic.  
* **Data Models**: Introduces the health attribute to the Player and Enemy data models.

### **Tech Stack**

* **Frontend Framework**: PixiJS (7.x) for rendering sprites and UI elements.

## **Testing**

* Verify that after colliding with an enemy, the combat screen shows both the player and enemy sprite.  
* Confirm the UI menu with "Attack" is visible.  
* Clicking "Attack" should reduce the enemy's displayed health.  
* After the player attacks, the enemy should automatically attack, reducing the player's health.  
* Confirm that turns alternate correctly.  
* Verify that when either character's health reaches zero, the battle ends and the game returns to the overworld.

## **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-01 | 1.0 | Initial draft | Scrum Master |

## **Dev Agent Record**

### **Agent Model Used**

*TBD*

### **Completion Notes List**

*TBD*

### **File List**

*TBD*

## **QA Results**

*TBD*