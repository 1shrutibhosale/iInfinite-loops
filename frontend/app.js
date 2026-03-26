// ===== Configuration =====
const API_BASE = '[localhost](http://localhost:3000/api)';

// ===== State Management =====
const state = {
    currentSection: 'chat',
    currentSubject: '',
    chatHistory: [],
    currentNotes: '',
    notesFormat: 'notes',
    quiz: {
        questions: [],
        currentIndex: 0,
        answers: [],
        isActive: false
    }
};

// ===== DOM Elements =====
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.content-section'),
    subjectSelect: document.getElementById('subjectSelect'),
    
    // Chat
    chatMessages: document.getElementById('chatMessages'),
    questionInput: document.getElementById('questionInput'),
    sendBtn: document.getElementById('sendBtn'),
    quickPrompts: document.querySelectorAll('.quick-prompt'),
    
    // Concepts
    conceptSearch: document.getElementById('conceptSearch'),
    difficultySelect: document.getElementById('difficultySelect'),
    explainBtn: document.getElementById('explainBtn'),
    topicGrid: document.getElementById('topicGrid'),
    conceptDisplay: document.getElementById('conceptDisplay'),
    
    // Notes
    noteTopic: document.getElementById('noteTopic'),
    formatBtns: document.querySelectorAll('.format-btn'),
    generateNotesBtn: document.getElementById('generateNotesBtn'),
    notesDisplay: document.getElementById('notesDisplay'),
    notesActions: document.getElementById('notesActions'),
    copyNotesBtn: document.getElementById('copyNotesBtn'),
    downloadNotesBtn: document.getElementById('downloadNotesBtn'),
    
    // Quiz
    quizSetup: document.getElementById('quizSetup'),
    quizActive: document.getElementById('quizActive'),
    quizResults: document.getElementById('quizResults'),
    quizTopic: document.getElementById('quizTopic'),
    quizCount: document.getElementById('quizCount'),
    quizDifficulty: document.getElementById('quizDifficulty'),
    startQuizBtn: document.getElementById('startQuizBtn'),
    questionCard: document.getElementById('questionCard'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    submitQuizBtn: document.getElementById('submitQuizBtn'),
    resultsSummary: document.getElementById('resultsSummary'),
    resultsDetails: document.getElementById('resultsDetails'),
    retakeQuizBtn: document.getElementById('retakeQuizBtn'),
    
    // Utilities
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer'),
    connectionStatus: document.getElementById('connectionStatus'),
    statusDot: document.querySelector('.status-dot')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    await checkConnection();
    loadTopics();
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => switchSection(item.dataset.section));
    });

    // Subject selection
    elements.subjectSelect.addEventListener('change', (e) => {
        state.currentSubject = e.target.value;
        loadTopics();
    });

    // Chat
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    elements.questionInput.addEventListener('input', autoResizeTextarea);
    elements.quickPrompts.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.questionInput.value = btn.dataset.prompt;
            sendMessage();
        });
    });

    // Concepts
    elements.explainBtn.addEventListener('click', explainConcept);
    elements.conceptSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') explainConcept();
    });

    // Notes
    elements.formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.notesFormat = btn.dataset.format;
        });
    });
    elements.generateNotesBtn.addEventListener('click', generateNotes);
    elements.copyNotesBtn.addEventListener('click', copyNotes);
    elements.downloadNotesBtn.addEventListener('click', downloadNotes);

    // Quiz
    elements.startQuizBtn.addEventListener('click', startQuiz);
    elements.prevQuestionBtn.addEventListener('click', () => navigateQuiz(-1));
    elements.nextQuestionBtn.addEventListener('click', () => navigateQuiz(1));
    elements.submitQuizBtn.addEventListener('click', submitQuiz);
    elements.retakeQuizBtn.addEventListener('click', resetQuiz);
}

// ===== Navigation =====
function switchSection(sectionId) {
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    elements.sections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionId}-section`);
    });

    state.currentSection = sectionId;
}

// ===== Connection Check =====
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            elements.connectionStatus.textContent = 'Connected';
            elements.statusDot.classList.add('connected');
            return true;
        }
    } catch (error) {
        console.warn('Backend not available, running in offline mode');
    }
    
    elements.connectionStatus.textContent = 'Offline Mode';
    elements.statusDot.classList.remove('connected');
    return false;
}

// ===== Chat Functions =====
async function sendMessage() {
    const question = elements.questionInput.value.trim();
    if (!question) return;

    // Add user message to chat
    addMessageToChat('user', question);
    elements.questionInput.value = '';
    elements.questionInput.style.height = 'auto';

    // Disable send button
    elements.sendBtn.disabled = true;

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/questions/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,
                subject: state.currentSubject
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        addMessageToChat('bot', data.answer);
        
        if (data.offline) {
            showToast('Running in offline mode. Some features may be limited.', 'warning');
        }

    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('bot', "I'm having trouble connecting to the server. Please check if the backend is running or try again later.");
        showToast('Failed to get response', 'error');
    } finally {
        hideLoading();
        elements.sendBtn.disabled = false;
    }
}

function addMessageToChat(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = type === 'bot' ? 'fa-robot' : 'fa-user';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${icon}"></i>
        </div>
        <div class="message-content">
            <p>${formatMessage(content)}</p>
        </div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    
    state.chatHistory.push({ type, content });
}

function formatMessage(content) {
    // Basic markdown-like formatting
    return content
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
}

// ===== Concepts Functions =====
async function loadTopics() {
    const topics = {
        dataStructures: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs'],
        operatingSystems: ['Processes', 'Scheduling', 'Deadlocks', 'Memory', 'Synchronization'],
        dbms: ['Normalization', 'ACID', 'Indexing', 'SQL', 'Transactions'],
        computerNetworks: ['OSI Model', 'TCP/IP', 'DNS', 'HTTP', 'Routing']
    };

    const selectedTopics = state.currentSubject 
        ? topics[state.currentSubject] || []
        : Object.values(topics).flat().slice(0, 8);

    elements.topicGrid.innerHTML = selectedTopics.map(topic => `
        <div class="topic-card" data-topic="${topic}">${topic}</div>
    `).join('');

    // Add click handlers
    elements.topicGrid.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
            elements.conceptSearch.value = card.dataset.topic;
            explainConcept();
        });
    });
}

async function explainConcept() {
    const topic = elements.conceptSearch.value.trim();
    if (!topic) {
        showToast('Please enter a topic', 'warning');
        return;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/concepts/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic,
                subject: state.currentSubject,
                difficulty: elements.difficultySelect.value
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        displayConcept(data);

    } catch (error) {
        console.error('Error:', error);
        elements.conceptDisplay.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load concept. Please try again.</p>
            </div>
        `;
        showToast('Failed to get explanation', 'error');
    } finally {
        hideLoading();
    }
}

function displayConcept(data) {
    const keyPointsHtml = data.keyPoints?.length 
        ? `<h3>Key Points</h3><ul>${data.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>`
        : '';

    const examplesHtml = data.examples?.length 
        ? `<h3>Examples</h3><ul>${data.examples.map(e => `<li><code>${e}</code></li>`).join('')}</ul>`
        : '';

    elements.conceptDisplay.innerHTML = `
        <div class="concept-content">
            <h2>${data.title || 'Concept'}</h2>
            <p>${data.explanation}</p>
            ${keyPointsHtml}
            ${examplesHtml}
        </div>
    `;
}

// ===== Notes Functions =====
async function generateNotes() {
    const topic = elements.noteTopic.value.trim();
    if (!topic) {
        showToast('Please enter a topic', 'warning');
        return;
    }

    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}/notes/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic,
                subject: state.currentSubject,
                format: state.notesFormat
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        state.currentNotes = data.content;
        displayNotes(data.content);
        elements.notesActions.style.display = 'flex';

        if (data.offline) {
            showToast('Generated from local data', 'warning');
        }

    } catch (error) {
        console.error('Error:', error);
        elements.notesDisplay.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to generate notes. Please try again.</p>
            </div>
        `;
        showToast('Failed to generate notes', 'error');
    } finally {
        hideLoading();
    }
}

function displayNotes(content) {
    // Convert markdown to HTML
    const html = content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    elements.notesDisplay.innerHTML = `<div class="notes-content"><p>${html}</p></div>`;
}

function copyNotes() {
    navigator.clipboard.writeText(state.currentNotes)
        .then(() => showToast('Notes copied to clipboard!', 'success'))
        .catch(() => showToast('Failed to copy notes', 'error'));
}

function downloadNotes() {
    const blob = new Blob([state.currentNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-notes-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Notes downloaded!', 'success');
}

// ===== Quiz Functions =====
async function startQuiz() {
    const topic = elements.quizTopic.value.trim();
    const count = parseInt(elements.quizCount.value);
    const difficulty = elements.quizDifficulty.value;

    try {
        showLoading();

        let url, options;
        
        if (state.currentSubject && !topic) {
            // Use local quiz data
            url = `${API_BASE}/quiz/subject/${state.currentSubject}?count=${count}`;
            options = { method: 'GET' };
        } else {
            // Generate custom quiz
            url = `${API_BASE}/quiz/generate`;
            options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic || state.currentSubject || 'general programming',
                    subject: state.currentSubject,
                    count,
                    difficulty
                })
            };
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        state.quiz = {
            questions: data.questions,
            currentIndex: 0,
            answers: new Array(data.questions.length).fill(null),
            isActive: true
        };

        showQuizQuestion();
        
        elements.quizSetup.style.display = 'none';
        elements.quizActive.style.display = 'block';
        elements.quizResults.style.display = 'none';

    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to start quiz. Please select a subject or enter a topic.', 'error');
    } finally {
        hideLoading();
    }
}

function showQuizQuestion() {
    const { questions, currentIndex, answers } = state.quiz;
    const question = questions[currentIndex];
    
    // Update progress
    const progress = ((currentIndex + 1) / questions.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;

    // Show question
    elements.questionCard.innerHTML = `
        <p class="question-text">${question.question}</p>
        <div class="options-list">
            ${question.options.map((option, index) => `
                <div class="option-item ${answers[currentIndex] === index ? 'selected' : ''}" 
                     data-index="${index}">
                    <span class="option-marker">${String.fromCharCode(65 + index)}</span>
                    <span>${option}</span>
                </div>
            `).join('')}
        </div>
    `;

    // Add click handlers
    elements.questionCard.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', () => selectAnswer(parseInt(item.dataset.index)));
    });

    // Update navigation buttons
    elements.prevQuestionBtn.disabled = currentIndex === 0;
    
    if (currentIndex === questions.length - 1) {
        elements.nextQuestionBtn.style.display = 'none';
        elements.submitQuizBtn.style.display = 'flex';
    } else {
        elements.nextQuestionBtn.style.display = 'flex';
        elements.submitQuizBtn.style.display = 'none';
    }
}

function selectAnswer(index) {
    state.quiz.answers[state.quiz.currentIndex] = index;
    
    elements.questionCard.querySelectorAll('.option-item').forEach((item, i) => {
        item.classList.toggle('selected', i === index);
    });
}

function navigateQuiz(direction) {
    const newIndex = state.quiz.currentIndex + direction;
    if (newIndex >= 0 && newIndex < state.quiz.questions.length) {
        state.quiz.currentIndex = newIndex;
        showQuizQuestion();
    }
}

async function submitQuiz() {
    const { questions, answers } = state.quiz;
    
    // Check if all questions answered
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
        const confirm = window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`);
        if (!confirm) return;
    }

    try {
        showLoading();

        const response = await fetch(`${API_BASE}/quiz/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers, questions })
        });

        const data = await response.json();
        
        displayResults(data);
        
        elements.quizActive.style.display = 'none';
        elements.quizResults.style.display = 'block';

    } catch (error) {
        // Fallback: calculate locally
        let correct = 0;
        const results = answers.map((answer, index) => {
            const question = questions[index];
            const isCorrect = answer === question.correct;
            if (isCorrect) correct++;
            return { isCorrect, correctAnswer: question.correct, explanation: question.explanation };
        });

        const score = Math.round((correct / questions.length) * 100);
        displayResults({
            score,
            correctAnswers: correct,
            totalQuestions: questions.length,
            grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
            results
        });

        elements.quizActive.style.display = 'none';
        elements.quizResults.style.display = 'block';
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    const { score, correctAnswers, totalQuestions, grade, results } = data;
    const { questions, answers } = state.quiz;

    elements.resultsSummary.innerHTML = `
        <div class="score-circle grade-${grade.toLowerCase()}">
            <span class="score-value">${score}%</span>
            <span class="score-label">Grade: ${grade}</span>
        </div>
        <div class="results-stats">
            <div class="stat-item">
                <div class="stat-value">${correctAnswers}</div>
                <div class="stat-label">Correct</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalQuestions - correctAnswers}</div>
                <div class="stat-label">Incorrect</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${totalQuestions}</div>
                <div class="stat-label">Total</div>
            </div>
        </div>
    `;

    elements.resultsDetails.innerHTML = results.map((result, index) => {
        const question = questions[index];
        const userAnswer = answers[index];
        
        return `
            <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                <p class="result-question">${index + 1}. ${question.question}</p>
                <p class="result-answer">
                    Your answer: <strong>${userAnswer !== null ? question.options[userAnswer] : 'Not answered'}</strong>
                    ${!result.isCorrect ? `<br>Correct answer: <strong>${question.options[result.correctAnswer]}</strong>` : ''}
                </p>
                ${result.explanation ? `<p class="result-explanation">${result.explanation}</p>` : ''}
            </div>
        `;
    }).join('');
}

function resetQuiz() {
    state.quiz = {
        questions: [],
        currentIndex: 0,
        answers: [],
        isActive: false
    };

    elements.quizSetup.style.display = 'block';
    elements.quizActive.style.display = 'none';
    elements.quizResults.style.display = 'none';
    
    // Reset form
    elements.quizTopic.value = '';
}

// ===== Utility Functions =====
function showLoading() {
    elements.loadingOverlay.classList.add('active');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('active');
}

function showToast(message, type = 'success') {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
