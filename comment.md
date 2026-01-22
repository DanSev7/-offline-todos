# Codebase Deep Dive & Commentary (Version 2.0)

This document provides a technical explanation of the final architecture, focusing on the **Scheduled Reminders** and **Production Readiness**.

---

## 1. The Database & Migrations (`/db`)

### Why explicit migrations?

When adding the `dueDate` feature, we modified the schema. In a real app, users already have the database on their phones.

- **The Solution**: In `client.ts`, we added an `ALTER TABLE` block wrapped in a `try/catch`. This safely adds the column to old databases without crashing the app for returning users.

---

## 2. The Logic Center (`/store/useTodoStore.ts`)

We transitioned from "Gamified Completion" to "Productivity Reminders".

### Correct Notification Trigger

We discovered that `date: Date` triggers can be unreliable in some Expo environments.

- **The Solution**: We switched to `TIME_INTERVAL` triggers.
- **Math**: `seconds = (DueDate - Now) / 1000`. This is the industry-standard way to ensure the OS fires the notification accurately.

```typescript
export const useTodoStore = create<TodoState>((set, get) => ({
  // ... imports and boilerplate ...

  addTodo: async (text: string, dueDate?: Date) => {
    try {
      await db.insert(todos).values({
        text,
        createdAt: new Date(),
        isCompleted: false,
        dueDate: dueDate ?? null,
      });

      // Industry Standard: TimeInterval Trigger
      if (dueDate && dueDate > new Date()) {
        const seconds = Math.floor((dueDate.getTime() - Date.now()) / 1000);
        if (seconds > 0) {
          await Notifications.scheduleNotificationAsync({
            content: { title: "Task Reminder ⏰", body: text, sound: true },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: seconds,
              repeats: false,
            },
          });
        }
      }
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },
  // ...
}));
```

---

## 3. UI Implementation Details

### A. Smart Reminders in `AddTodo.tsx`

Users hate picking dates manually.

- **The Solution**: We implemented **Quick Presets** (5m, 15m, 1h).
- **Logic**: Clicking a chip calculates the offset immediately.
- **Crash Prevention**: We encountered a conflict where opening the DatePicker while the Keyboard was closing caused a `TypeError`. We resolved this by ensuring state updates are clean before showing native dialogs.

### B. Android Notification Channels in `_layout.tsx`

On Android 13+, notifications require two things: Permissions AND a Channel.

- **The Solution**: We added `setNotificationChannelAsync("default", ...)`. Without this, the system accepts the notification but never displays it to the user.

### C. Manual Verification in `settings.tsx`

Debugging notifications is hard because you have to wait for timers.

- **The Solution**: Added a "Test Notification" button. This triggers an **immediate** (`trigger: null`) notification to confirm that permissions and channels are configured correctly.

---

## 4. Production APK Strategy

The 218MB size was due to the **Metro Debugger** being embedded in the app.

- **The Solution**: In `eas.json`, we set `buildType: "apk"` for the preview profile.
- **Result**: A standalone 30MB file that includes the pre-compiled JavaScript bundle, making it completely independent of your development computer.
