1. **Update Types (`app/lib/types.ts`):**
   - Add `target_stage?: string;` to the `Task` interface.
2. **Modify `components/AddTaskModal.tsx`:**
   - Add a state `targetStage` (initial value: 'Vegetativo').
   - **Conditional UI:** If `selectedTaskType?.id === 'cambio_etapa'`, show a `Select` dropdown for "Etapa Destino" with options: 'Germinación', 'Plántula', 'Vegetativo', 'Enraizamiento', 'Floración', 'Secado', 'Curado'.
   - Pass `targetStage` to the Server Action `createTask`.
3. **Modify `components/EditTaskModal.tsx`:**
   - Implement the same display and edit logic for `target_stage` if the task type is `cambio_etapa`.
4. **Refactor Server Actions (`app/actions/tasks.ts`):**
   - **`createTask`:** Receive and save `target_stage` to the database.
   - **`updateTask`:** Handle updating `target_stage`.
   - **`toggleTaskStatus` (Update Logic):**
     - When marking a task as `'completed'`, add a condition: If `task.type === 'cambio_etapa'` and it has a `target_stage`.
     - Identify the corresponding date column in the `plants` table based on the `target_stage` (e.g., 'Floración' -> `date_floracion`, 'Vegetativo' -> `date_vegetativo`).
     - Perform an `update` on the `plants` table for all plants linked to the task (via `task_plants`), setting the identified date column to `new Date().toISOString()`.
     - Also update the `stage` column of the plant with the new `target_stage`.
5. **Pre-commit checks**
   - Ensure proper testing, verification, review, and reflection are done using pre_commit_instructions tool.
