const switchColorModeBtn = document.querySelector('.btn');

// elements to change colors
const sunIcon = document.querySelector('.fa-sun');
const moonIcon = document.querySelector('.fa-moon');
const body = document.querySelector('body');
const main = document.querySelector('main');
const subjectBox = document.querySelectorAll('.subject-box__item');
const categoryText = document.querySelector('.category-text');
const questionParagraphs = document.querySelectorAll('.question-section p');
const answerBoxes = document.querySelectorAll('.answer-box__item');
const summaryBox = document.querySelector('.summary-content__box');
const scoreRange = document.querySelector('.score-range');

//sections
const welcomeSection = document.querySelector('.welcome-section');
const subjectSection = document.querySelector('.subject-container');
const questionSection = document.querySelector('.question-section');
const answerSection = document.querySelector('.answers-section');
const quizSummarySection = document.querySelector('.quiz-summary');

//btn
const playAgainBtn = document.querySelector('.summary-content__btn');

const bgPattern = document.querySelector('.bg-pattern');

let questionCount = 0; //question progress
let correctAnswers = 0; //correct answer counter
let currentQuestion = 0;
let quizData = [];

const itemsToChangeColor = [
	sunIcon,
	moonIcon,
	body,
	main,
	...subjectBox,
	categoryText,
	...questionParagraphs,
	...answerBoxes,
	summaryBox,
	scoreRange,
];

// Dark mode toggle
switchColorModeBtn.addEventListener('click', () => {
	itemsToChangeColor.forEach(item => item.classList.toggle('dark-mode'));
});

// Fetch data
fetch('data.json')
	.then(res => {
		if (!res.ok) throw new Error('Error loading JSON file');
		return res.json();
	})
	.then(data => {
		quizData = data;
		addCategoryListeners();
	})
	.catch(err => console.error('Error occurred:', err));

//updaying category panel
const updateCategoryPanel = (categoryPanel, clickedElement) => {
	const iconClassList = [...clickedElement.children[0].classList].join(' ');
	const imgSrc =
		clickedElement.children[0].children[0]?.getAttribute('src') || '';

	categoryPanel.innerHTML = `
		<div class="${iconClassList}">
			<img src="${imgSrc}" alt="">
		</div>
		<p class="category-text">${clickedElement.children[1]?.textContent || ''}</p>
	`;
	categoryPanel.style.opacity = '1';
};

//upadting question content
const updateQuestionContent = (questionIndex, quizIndex) => {
	const quiz = quizData.quizzes[quizIndex];
	if (!quiz || !quiz.questions[questionIndex]) return;

	const questionObj = quiz.questions[questionIndex];
	const progressBar = document.querySelector('.progress');

	questionIndex++;
	const currentProgressIndex = questionIndex + 1;
	console.log(questionIndex);
	const updateProgress = () => {
		const progress = ((currentProgressIndex - 1) / 10) * 100;
		if (progressBar) progressBar.style.width = `${progress}%`;
	};

	questionSection.innerHTML = `
		<p class="question-number"><em>Question ${questionIndex} of 10</em></p>
		<p class="question-content">${questionObj.question}</p>
		<div class="question-progressbar">
					<div class="progress" style="width: ${
						((currentProgressIndex - 1) / 10) * 100
					}%"</div>
				</div>
	`;

	updateProgress();
	applyDarkModeToNewElements();
};

//updating section answers
const updateAnswerSection = (questionIndex, quizIndex) => {
	const quiz = quizData.quizzes[quizIndex];
	if (!quiz || !quiz.questions[questionIndex]) return;

	const questionObj = quiz.questions[questionIndex];

	answerSection.innerHTML = `
		<div class="answer-box">
			${questionObj.options
				.map(
					(option, i) => `
				<div class="answer-box__item">
					<div class="flexbox">
						<p class="answer-box__item--abcd">${String.fromCharCode(97 + i)}</p>
						<p class="answer-box__item--content">${option}</p>
					</div>
					<img class="hidden">
				</div>
			`
				)
				.join('')}
		</div>
		<button class="submit-btn">Submit Answer</button>
		<div class="error-msg hidden">
			<img src="./images/icon-error.svg" alt="" />
			<p class="error-msg--content">Please select an answer</p>
		</div>
	`;
};

// selecting anwswer
const handleSelectedAnswer = () => {
	const allAnswerBoxes = document.querySelectorAll('.answer-box__item');

	allAnswerBoxes.forEach(answer => {
		answer.addEventListener('click', e => {
			allAnswerBoxes.forEach(el => el.classList.remove('active'));
			e.currentTarget.classList.add('active');
		});
	});
};

// hiding and showing seciotn
const toggleSections = () => {
	welcomeSection.classList.add('hidden-section');
	subjectSection.classList.add('hidden-section');
	questionSection.classList.remove('hidden-section');
	answerSection.classList.remove('hidden-section');
};

//updating dark mode for new elements
const applyDarkModeToNewElements = () => {
	const newElements = document.querySelectorAll(
		'.question-number, .question-content, .category-text, .answer-box__item, .answer-box__item--content'
	);

	// checking if dark-mode is active
	if (body.classList.contains('dark-mode')) {
		newElements.forEach(el => el.classList.add('dark-mode'));
	}

	switchColorModeBtn.removeEventListener('click', toggleDarkModeForNewElements);
	switchColorModeBtn.addEventListener('click', toggleDarkModeForNewElements);
};

const toggleDarkModeForNewElements = () => {
	const newElements = document.querySelectorAll(
		'.question-number, .question-content, .category-text, .answer-box__item, .answer-box__item--content'
	);
	newElements.forEach(el => el.classList.toggle('dark-mode'));
};

//catergory clicking service
const handleCategorySelection = (index, categoryPanel, clickedElement) => {
	questionCount++;
	updateCategoryPanel(categoryPanel, clickedElement);
	updateQuestionContent(currentQuestion, index);
	updateAnswerSection(currentQuestion, index);
	toggleSections();
	applyDarkModeToNewElements();
	handleSelectedAnswer();
	handleCorrectAnswer(quizData, index, currentQuestion);
	console.log(index, categoryPanel, clickedElement);
};

//add eventListners to category
const addCategoryListeners = () => {
	const categoryPanel = document.querySelector('.category-panel');

	subjectBox.forEach((box, index) => {
		box.addEventListener('click', e => {
			const clickedElement = e.target.closest('.subject-box__item');
			if (!clickedElement) return;
			handleCategorySelection(index, categoryPanel, clickedElement);
		});
	});
};

//checking compatibility with question content and correct answers
const handleCorrectAnswer = (quizData, categoryIndex, questionIndex) => {
	const answerBoxItems = document.querySelectorAll('.answer-box__item');
	const submitBtn = document.querySelector('.submit-btn');
	const errMsgAnswer = document.querySelector('.error-msg');
	const finalScore = document.querySelector('.score');
	console.log(errMsgAnswer);

	// Pobranie poprawnej odpowiedzi
	const currentQuestionAnswer =
		quizData.quizzes[categoryIndex].questions[questionIndex].answer;

	let selectedAnswer = null;

	answerBoxItems.forEach(item => {
		item.addEventListener('click', e => {
			answerBoxItems.forEach(el => el.classList.remove('active'));

			e.currentTarget.classList.add('active');

			selectedAnswer = e.currentTarget
				.querySelector('.answer-box__item--content')
				.textContent.trim();
			console.log(selectedAnswer);
		});
	});

	//deleting previous liteners for no interferation
	submitBtn.replaceWith(submitBtn.cloneNode(true));
	const newSubmitBtn = document.querySelector('.submit-btn');

	newSubmitBtn.addEventListener('click', () => {
		if (!selectedAnswer) {
			console.log('Nie wybrano odpowiedzi!');
			errMsgAnswer.classList.remove = 'hidden';
			errMsgAnswer.style.opacity = `1`;

			errMsgAnswer.style.transition = 'opacity 0.3s ease-in-out';
			errMsgAnswer.style.opacity = '1';
			setTimeout(() => (errMsgAnswer.style.opacity = '0.7'), 300);
			setTimeout(() => (errMsgAnswer.style.opacity = '1'), 600);

			return;
		}

		// finding correct answer
		const correctAnswerElement = [...answerBoxItems].find(
			item =>
				item.querySelector('.answer-box__item--content').textContent.trim() ===
				currentQuestionAnswer
		);
		const correctAnsImg = correctAnswerElement.querySelector('img');
		correctAnsImg.setAttribute('src', './images/icon-correct.svg');
		correctAnsImg.classList.remove('hidden');

		if (selectedAnswer === currentQuestionAnswer) {
			console.log(correctAnswerElement);
			correctAnswerElement.classList.add('correct');
			errMsgAnswer.style.opacity = `0`;
			correctAnswers++;
		} else {
			console.log('BŁĄD - niepoprawna odpowiedź');

			// finding clicked wrong element
			const selectedElement = [...answerBoxItems].find(
				item =>
					item
						.querySelector('.answer-box__item--content')
						.textContent.trim() === selectedAnswer
			);

			if (selectedElement) {
				const errorImg = selectedElement.querySelector('img');
				errorImg.setAttribute('src', './images/icon-error.svg');
				errorImg.classList.remove('hidden');
				selectedElement.classList.add('wrong');
				errMsgAnswer.style.opacity = `0`;
			}
		}

		answerBoxItems.forEach(ans => {
			ans.style.pointerEvents = 'none';
		});
		newSubmitBtn.textContent = `Go to the next question`;

		newSubmitBtn.addEventListener(
			'click',
			() => {
				questionIndex++;

				if (questionIndex < quizData.quizzes[categoryIndex].questions.length) {
					updateAnswerSection(questionIndex, categoryIndex);
					updateQuestionContent(questionIndex, categoryIndex);
					handleCorrectAnswer(quizData, categoryIndex, questionIndex);
					handleSelectedAnswer(); //again adding listner to new questions
					console.log(correctAnswers);
					console.log(questionIndex);
				} else {
					newSubmitBtn.textContent = `Finish Quiz`;
					newSubmitBtn.disabled = true;
					finalScore.textContent = correctAnswers / 2;
					answerSection.classList.add('hidden-section');
					questionSection.classList.add('hidden-section');
					quizSummarySection.classList.remove('hidden-section');
				}
			},
			{ once: true }
		);
	});
};

const moveFocusToNext = selector => {
	const nextElement = document.querySelector(selector);
	if (nextElement) nextElement.focus();
};

// Po kliknięciu Submit, ustaw focus na następne pytanie
document.addEventListener('click', e => {
	if (e.target.classList.contains('submit-btn')) {
		moveFocusToNext('.question-section p'); // Ustaw focus na kolejne pytanie
	}
});

playAgainBtn.addEventListener('click', () => {
	location.reload();
});

switchColorModeBtn.addEventListener('click', () => {
	bgPattern.setAttribute(
		'src',
		body.classList.contains('dark-mode')
			? './images/pattern-background-mobile-dark.svg'
			: '/images/pattern-background-mobile-light.svg'
	);
});
