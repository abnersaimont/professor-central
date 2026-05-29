const storageKey = "professor-central-data";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const newTaskButton = document.querySelector("#newTaskButton");

const classForm = document.querySelector("#classForm");
const classList = document.querySelector("#classList");
const studentForm = document.querySelector("#studentForm");
const studentList = document.querySelector("#studentList");
const studentEmptyState = document.querySelector("#studentEmptyState");
const studentPanelTag = document.querySelector("#studentPanelTag");

const classCount = document.querySelector("#classCount");
const studentCount = document.querySelector("#studentCount");
const classSummary = document.querySelector("#classSummary");
const studentSummary = document.querySelector("#studentSummary");
const selectedClassLabel = document.querySelector("#selectedClassLabel");
const selectedClassSummary = document.querySelector("#selectedClassSummary");

const initialData = {
  selectedClassId: null,
  classes: [
    {
      id: crypto.randomUUID(),
      name: "8o Ano B",
      subject: "Historia",
      shift: "Manha",
      year: "2026",
      students: [
        {
          id: crypto.randomUUID(),
          name: "Ana Beatriz",
          registration: "2026-084",
          guardian: "Maria Beatriz",
          notes: "Boa participacao em debates"
        },
        {
          id: crypto.randomUUID(),
          name: "Lucas Henrique",
          registration: "2026-091",
          guardian: "Carlos Henrique",
          notes: "Precisa reforco em leitura"
        }
      ]
    }
  ]
};

let state = loadState();

function loadState() {
  try {
    const savedState = localStorage.getItem(storageKey);
    if (!savedState) {
      return initialData;
    }

    const parsed = JSON.parse(savedState);
    if (!Array.isArray(parsed.classes)) {
      return initialData;
    }

    return {
      selectedClassId: parsed.selectedClassId || parsed.classes[0]?.id || null,
      classes: parsed.classes.map((item) => ({
        ...item,
        students: Array.isArray(item.students) ? item.students : []
      }))
    };
  } catch (error) {
    return initialData;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getSelectedClass() {
  return state.classes.find((item) => item.id === state.selectedClassId) || null;
}

function getStudentCount() {
  return state.classes.reduce((total, item) => total + item.students.length, 0);
}

function createTaskElement(label) {
  const item = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  item.append(checkbox, document.createTextNode(` ${label}`));
  return item;
}

function createMetaChip(text) {
  const chip = document.createElement("span");
  chip.className = "meta-chip";
  chip.textContent = text;
  return chip;
}

function renderStats() {
  const selectedClass = getSelectedClass();
  const totalStudents = getStudentCount();

  classCount.textContent = String(state.classes.length);
  studentCount.textContent = String(totalStudents);
  classSummary.textContent = state.classes.length
    ? `${state.classes[0].year} • ${state.classes.length} turma(s) organizadas`
    : "Comece cadastrando sua primeira turma";
  studentSummary.textContent = totalStudents
    ? `${totalStudents} aluno(s) registrados no momento`
    : "Organize listas por turma";
  selectedClassLabel.textContent = selectedClass ? selectedClass.name : "-";
  selectedClassSummary.textContent = selectedClass
    ? `${selectedClass.students.length} aluno(s) em ${selectedClass.subject}`
    : "Selecione uma turma para ver os alunos";
}

function renderClasses() {
  classList.innerHTML = "";

  if (!state.classes.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "Nenhuma turma cadastrada ainda.";
    classList.append(emptyState);
    return;
  }

  state.classes.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = `class-item${item.id === state.selectedClassId ? " active" : ""}`;

    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.name;

    const subtitle = document.createElement("p");
    subtitle.textContent = `${item.subject} | ${item.shift} | ${item.students.length} aluno(s)`;

    const meta = document.createElement("div");
    meta.className = "class-meta";
    meta.append(createMetaChip(`Ano ${item.year}`));

    content.append(title, subtitle, meta);

    const actions = document.createElement("button");
    actions.type = "button";
    actions.textContent = item.id === state.selectedClassId ? "Selecionada" : "Selecionar";
    actions.addEventListener("click", () => {
      state.selectedClassId = item.id;
      saveState();
      renderApp();
    });

    wrapper.append(content, actions);
    classList.append(wrapper);
  });
}

function renderStudents() {
  const selectedClass = getSelectedClass();
  studentList.innerHTML = "";

  if (!selectedClass) {
    studentEmptyState.hidden = false;
    studentPanelTag.textContent = "Selecione uma turma";
    studentForm.querySelector("button").disabled = true;
    return;
  }

  studentEmptyState.hidden = selectedClass.students.length > 0;
  studentPanelTag.textContent = `${selectedClass.name} • ${selectedClass.subject}`;
  studentForm.querySelector("button").disabled = false;

  if (!selectedClass.students.length) {
    studentEmptyState.textContent = "Essa turma ainda nao tem alunos cadastrados.";
    return;
  }

  selectedClass.students.forEach((student) => {
    const item = document.createElement("li");
    item.className = "student-item";

    const header = document.createElement("header");
    const titleBlock = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = student.name;
    const registration = document.createElement("p");
    registration.textContent = student.registration || "Sem matricula informada";
    titleBlock.append(title, registration);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remover";
    removeButton.addEventListener("click", () => {
      selectedClass.students = selectedClass.students.filter((itemStudent) => itemStudent.id !== student.id);
      saveState();
      renderApp();
    });

    header.append(titleBlock, removeButton);

    const meta = document.createElement("div");
    meta.className = "student-meta";
    if (student.guardian) {
      meta.append(createMetaChip(`Responsavel: ${student.guardian}`));
    }
    if (student.notes) {
      meta.append(createMetaChip(student.notes));
    }

    item.append(header, meta);
    studentList.append(item);
  });
}

function renderApp() {
  renderStats();
  renderClasses();
  renderStudents();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const label = taskInput.value.trim();
  if (!label) {
    taskInput.focus();
    return;
  }

  taskList.prepend(createTaskElement(label));
  taskInput.value = "";
  taskInput.focus();
});

newTaskButton.addEventListener("click", () => {
  taskInput.focus();
  taskInput.scrollIntoView({ behavior: "smooth", block: "center" });
});

classForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(classForm);
  const newClass = {
    id: crypto.randomUUID(),
    name: formData.get("className").toString().trim(),
    subject: formData.get("classSubject").toString().trim(),
    shift: formData.get("classShift").toString(),
    year: formData.get("classYear").toString().trim(),
    students: []
  };

  if (!newClass.name || !newClass.subject || !newClass.year) {
    return;
  }

  state.classes.unshift(newClass);
  state.selectedClassId = newClass.id;
  saveState();
  classForm.reset();
  classForm.querySelector("#classYear").value = "2026";
  renderApp();
});

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedClass = getSelectedClass();
  if (!selectedClass) {
    return;
  }

  const formData = new FormData(studentForm);
  const student = {
    id: crypto.randomUUID(),
    name: formData.get("studentName").toString().trim(),
    registration: formData.get("studentRegistration").toString().trim(),
    guardian: formData.get("studentGuardian").toString().trim(),
    notes: formData.get("studentNotes").toString().trim()
  };

  if (!student.name) {
    return;
  }

  selectedClass.students.unshift(student);
  saveState();
  studentForm.reset();
  renderApp();
});

renderApp();
