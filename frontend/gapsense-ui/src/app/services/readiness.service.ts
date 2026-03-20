import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

import { Question, QuestionFilter } from '../models/readiness/question.model';
import { Quiz, QuizSchedule } from '../models/readiness/quiz.model';
import {
  Submission,
  AttemptSummary,
  SubmissionStats,
  AttemptStats,
} from '../models/readiness/submission.model';
import { Resource } from '../models/readiness/resource.model';

// ============================================
// MOCK DATA - this will be replaced with real API calls in Stage 2
// all the data here is just for testing the UI
// ============================================

// --- mock questions for the question bank ---
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    questionId: 'QB-3040-001',
    title: 'Time Complexity of Binary Search',
    questionText:
      'What is the time complexity of a binary search algorithm on a sorted array of n elements?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'Asymptotic Analysis',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    options: [
      { id: 'a', optionText: 'O(n)', isCorrect: false },
      { id: 'b', optionText: 'O(log n)', isCorrect: true },
      { id: 'c', optionText: 'O(n log n)', isCorrect: false },
      { id: 'd', optionText: 'O(1)', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Binary search divides the array in half each time, so the time complexity is O(log n).',
    marks: 5,
    status: 'Active',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: '2',
    questionId: 'QB-3040-002',
    title: 'Stack Data Structure Properties',
    questionText:
      'Which principle does a Stack data structure follow?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    topic: 'Linear Data Structures',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    options: [
      { id: 'a', optionText: 'FIFO (First In First Out)', isCorrect: false },
      { id: 'b', optionText: 'LIFO (Last In First Out)', isCorrect: true },
      { id: 'c', optionText: 'Random Access', isCorrect: false },
      { id: 'd', optionText: 'Priority Based', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation: 'Stack follows LIFO - the last element pushed is the first one popped.',
    marks: 3,
    status: 'Active',
    createdAt: '2026-01-16',
    updatedAt: '2026-01-16',
  },
  {
    id: '3',
    questionId: 'QB-3040-003',
    title: 'SQL JOIN Types',
    questionText:
      'Which SQL JOIN returns all rows from both tables, matching where possible?',
    questionType: 'MCQ',
    difficulty: 'Hard',
    topic: 'Database Queries',
    module: 'Database Management Systems',
    moduleCode: 'IT3030',
    options: [
      { id: 'a', optionText: 'INNER JOIN', isCorrect: false },
      { id: 'b', optionText: 'LEFT JOIN', isCorrect: false },
      { id: 'c', optionText: 'FULL OUTER JOIN', isCorrect: true },
      { id: 'd', optionText: 'CROSS JOIN', isCorrect: false },
    ],
    correctOptionId: 'c',
    explanation:
      'FULL OUTER JOIN returns all rows from both tables, with NULL where there is no match.',
    marks: 5,
    status: 'Active',
    createdAt: '2026-01-18',
    updatedAt: '2026-02-01',
  },
  {
    id: '4',
    questionId: 'QB-3040-004',
    title: 'OOP Encapsulation Concept',
    questionText:
      'What is the main purpose of encapsulation in Object Oriented Programming?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    topic: 'OOP Fundamentals',
    module: 'Object Oriented Programming',
    moduleCode: 'IT1040',
    options: [
      { id: 'a', optionText: 'To make code run faster', isCorrect: false },
      { id: 'b', optionText: 'To hide internal data and restrict direct access', isCorrect: true },
      { id: 'c', optionText: 'To allow multiple inheritance', isCorrect: false },
      { id: 'd', optionText: 'To create multiple objects', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Encapsulation bundles data and methods together and restricts direct access to internal data.',
    marks: 3,
    status: 'Active',
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20',
  },
  {
    id: '5',
    questionId: 'QB-3040-005',
    title: 'Normalization in Databases',
    questionText:
      'What is the primary goal of database normalization?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'Database Design',
    module: 'Database Management Systems',
    moduleCode: 'IT3030',
    options: [
      { id: 'a', optionText: 'To increase data redundancy', isCorrect: false },
      { id: 'b', optionText: 'To reduce data redundancy and improve integrity', isCorrect: true },
      { id: 'c', optionText: 'To make queries faster', isCorrect: false },
      { id: 'd', optionText: 'To add more tables to the database', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Normalization organizes data to reduce redundancy and improve data integrity.',
    marks: 4,
    status: 'Draft',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-05',
  },
  {
    id: '6',
    questionId: 'QB-3040-006',
    title: 'Graph Traversal - BFS',
    questionText:
      'Which data structure is used in Breadth First Search (BFS) traversal?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'Graph Algorithms',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    options: [
      { id: 'a', optionText: 'Stack', isCorrect: false },
      { id: 'b', optionText: 'Queue', isCorrect: true },
      { id: 'c', optionText: 'Heap', isCorrect: false },
      { id: 'd', optionText: 'Linked List', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation: 'BFS uses a Queue to explore nodes level by level.',
    marks: 4,
    status: 'Active',
    createdAt: '2026-02-03',
    updatedAt: '2026-02-03',
  },
  {
    id: '7',
    questionId: 'QB-3040-007',
    title: 'Software Testing - Black Box',
    questionText:
      'In black box testing, the tester has knowledge of which of the following?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    topic: 'Testing Fundamentals',
    module: 'Software Quality Assurance',
    moduleCode: 'IT4020',
    options: [
      { id: 'a', optionText: 'Internal code structure', isCorrect: false },
      { id: 'b', optionText: 'Only input and expected output', isCorrect: true },
      { id: 'c', optionText: 'Database schema', isCorrect: false },
      { id: 'd', optionText: 'Server configuration', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Black box testing focuses only on inputs and expected outputs without knowing internal code.',
    marks: 3,
    status: 'Active',
    createdAt: '2026-02-05',
    updatedAt: '2026-02-05',
  },
  {
    id: '8',
    questionId: 'QB-3040-008',
    title: 'Linked List vs Array',
    questionText:
      'What is the main advantage of a linked list over an array?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'Linear Data Structures',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    options: [
      { id: 'a', optionText: 'Faster random access', isCorrect: false },
      { id: 'b', optionText: 'Dynamic size - no need to define size upfront', isCorrect: true },
      { id: 'c', optionText: 'Less memory usage', isCorrect: false },
      { id: 'd', optionText: 'Better cache performance', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Linked lists can grow and shrink dynamically, unlike arrays which have a fixed size.',
    marks: 4,
    status: 'Active',
    createdAt: '2026-02-07',
    updatedAt: '2026-02-07',
  },
  {
    id: '9',
    questionId: 'QB-3040-009',
    title: 'Design Pattern - Singleton',
    questionText:
      'What does the Singleton design pattern ensure?',
    questionType: 'MCQ',
    difficulty: 'Hard',
    topic: 'Design Patterns',
    module: 'Software Engineering',
    moduleCode: 'IT3011',
    options: [
      { id: 'a', optionText: 'Multiple instances of a class', isCorrect: false },
      { id: 'b', optionText: 'Only one instance of a class exists', isCorrect: true },
      { id: 'c', optionText: 'Classes cannot be inherited', isCorrect: false },
      { id: 'd', optionText: 'Objects are created lazily', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Singleton ensures a class has only one instance and provides a global point of access.',
    marks: 5,
    status: 'Active',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10',
  },
  {
    id: '10',
    questionId: 'QB-3040-010',
    title: 'HTTP Status Code 404',
    questionText: 'What does HTTP status code 404 indicate?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    topic: 'Web Fundamentals',
    module: 'Web Application Development',
    moduleCode: 'IT2080',
    options: [
      { id: 'a', optionText: 'Server error', isCorrect: false },
      { id: 'b', optionText: 'Unauthorized access', isCorrect: false },
      { id: 'c', optionText: 'Resource not found', isCorrect: true },
      { id: 'd', optionText: 'Request timeout', isCorrect: false },
    ],
    correctOptionId: 'c',
    explanation: '404 means the server cannot find the requested resource.',
    marks: 2,
    status: 'Active',
    createdAt: '2026-02-12',
    updatedAt: '2026-02-12',
  },
  {
    id: '11',
    questionId: 'QB-3040-011',
    title: 'Recursion Base Case',
    questionText: 'What happens if a recursive function does not have a base case?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'Recursion',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    options: [
      { id: 'a', optionText: 'It returns null', isCorrect: false },
      { id: 'b', optionText: 'It runs in O(1) time', isCorrect: false },
      { id: 'c', optionText: 'It causes infinite recursion (stack overflow)', isCorrect: true },
      { id: 'd', optionText: 'It automatically stops', isCorrect: false },
    ],
    correctOptionId: 'c',
    explanation:
      'Without a base case, the function keeps calling itself and causes a stack overflow.',
    marks: 4,
    status: 'Draft',
    createdAt: '2026-02-14',
    updatedAt: '2026-02-14',
  },
  {
    id: '12',
    questionId: 'QB-3040-012',
    title: 'Topological Sort',
    questionText:
      'Consider a directed acyclic graph (DAG). Which algorithm can perform a topological sort?',
    questionType: 'MCQ',
    difficulty: 'Hard',
    topic: 'Graph Algorithms',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    options: [
      { id: 'a', optionText: 'Dijkstra\'s Algorithm', isCorrect: false },
      { id: 'b', optionText: 'Kahn\'s Algorithm (BFS-based)', isCorrect: true },
      { id: 'c', optionText: 'Prim\'s Algorithm', isCorrect: false },
      { id: 'd', optionText: 'Floyd-Warshall Algorithm', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Kahn\'s algorithm uses BFS and in-degree tracking to perform topological sort on a DAG.',
    marks: 5,
    status: 'Active',
    createdAt: '2026-02-16',
    updatedAt: '2026-02-16',
  },
  {
    id: '13',
    questionId: 'QB-3040-013',
    title: 'ACID Properties',
    questionText: 'Which of the following is NOT an ACID property of database transactions?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'Database Transactions',
    module: 'Database Management Systems',
    moduleCode: 'IT3030',
    options: [
      { id: 'a', optionText: 'Atomicity', isCorrect: false },
      { id: 'b', optionText: 'Consistency', isCorrect: false },
      { id: 'c', optionText: 'Availability', isCorrect: true },
      { id: 'd', optionText: 'Durability', isCorrect: false },
    ],
    correctOptionId: 'c',
    explanation:
      'ACID stands for Atomicity, Consistency, Isolation, Durability. Availability is not part of ACID.',
    marks: 4,
    status: 'Active',
    createdAt: '2026-02-18',
    updatedAt: '2026-02-18',
  },
  {
    id: '14',
    questionId: 'QB-3040-014',
    title: 'Polymorphism in OOP',
    questionText: 'Which type of polymorphism is method overloading?',
    questionType: 'MCQ',
    difficulty: 'Medium',
    topic: 'OOP Fundamentals',
    module: 'Object Oriented Programming',
    moduleCode: 'IT1040',
    options: [
      { id: 'a', optionText: 'Runtime polymorphism', isCorrect: false },
      { id: 'b', optionText: 'Compile-time polymorphism', isCorrect: true },
      { id: 'c', optionText: 'Dynamic polymorphism', isCorrect: false },
      { id: 'd', optionText: 'Virtual polymorphism', isCorrect: false },
    ],
    correctOptionId: 'b',
    explanation:
      'Method overloading is resolved at compile time, so it is compile-time (static) polymorphism.',
    marks: 4,
    status: 'Active',
    createdAt: '2026-02-20',
    updatedAt: '2026-02-20',
  },
  {
    id: '15',
    questionId: 'QB-3040-015',
    title: 'REST API Methods',
    questionText: 'Which HTTP method is used to update an existing resource in a REST API?',
    questionType: 'MCQ',
    difficulty: 'Easy',
    topic: 'Web Fundamentals',
    module: 'Web Application Development',
    moduleCode: 'IT2080',
    options: [
      { id: 'a', optionText: 'GET', isCorrect: false },
      { id: 'b', optionText: 'POST', isCorrect: false },
      { id: 'c', optionText: 'PUT', isCorrect: true },
      { id: 'd', optionText: 'DELETE', isCorrect: false },
    ],
    correctOptionId: 'c',
    explanation: 'PUT is used to update an existing resource. POST is for creating new resources.',
    marks: 2,
    status: 'Archived',
    createdAt: '2026-02-22',
    updatedAt: '2026-03-01',
  },
];

// --- mock quizzes for quiz builder and scheduling ---
const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Mid-Semester Assessment - Data Structures',
    description: 'Covers topics from weeks 1-7 including arrays, linked lists, stacks, queues, and trees.',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    intake: 'February 2024',
    questions: [
      { questionId: '1', order: 1, marks: 5 },
      { questionId: '2', order: 2, marks: 3 },
      { questionId: '6', order: 3, marks: 4 },
      { questionId: '8', order: 4, marks: 4 },
      { questionId: '11', order: 5, marks: 4 },
      { questionId: '12', order: 6, marks: 5 },
    ],
    totalQuestions: 6,
    totalMarks: 25,
    passingMarks: 10,
    passingPercentage: 40,
    timeLimitMinutes: 60,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    status: 'Published',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-10',
  },
  {
    id: '2',
    title: 'Unit 3 - OOP Analysis Quiz',
    description: 'Assessment on OOP concepts including encapsulation, inheritance, and polymorphism.',
    module: 'Object Oriented Programming',
    moduleCode: 'IT1040',
    intake: 'February 2024',
    questions: [
      { questionId: '4', order: 1, marks: 3 },
      { questionId: '14', order: 2, marks: 4 },
    ],
    totalQuestions: 2,
    totalMarks: 7,
    passingMarks: 3,
    passingPercentage: 40,
    timeLimitMinutes: 30,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: true,
    status: 'Draft',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
  },
  {
    id: '3',
    title: 'Database Fundamentals Quiz',
    description: 'Covers SQL queries, normalization, ACID properties and basic database design.',
    module: 'Database Management Systems',
    moduleCode: 'IT3030',
    intake: 'February 2024',
    questions: [
      { questionId: '3', order: 1, marks: 5 },
      { questionId: '5', order: 2, marks: 4 },
      { questionId: '13', order: 3, marks: 4 },
    ],
    totalQuestions: 3,
    totalMarks: 13,
    passingMarks: 5,
    passingPercentage: 40,
    timeLimitMinutes: 45,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    status: 'Scheduled',
    createdAt: '2026-02-20',
    updatedAt: '2026-03-01',
  },
  {
    id: '4',
    title: 'Final Revision - SQA',
    description: 'Final revision quiz covering all SQA topics including testing methods and quality models.',
    module: 'Software Quality Assurance',
    moduleCode: 'IT4020',
    intake: 'February 2024',
    questions: [
      { questionId: '7', order: 1, marks: 3 },
    ],
    totalQuestions: 1,
    totalMarks: 3,
    passingMarks: 1,
    passingPercentage: 40,
    timeLimitMinutes: 20,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    status: 'Published',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-05',
  },
  {
    id: '5',
    title: 'Web Development Basics',
    description: 'Covers HTTP fundamentals, REST APIs, and basic web concepts.',
    module: 'Web Application Development',
    moduleCode: 'IT2080',
    intake: 'February 2024',
    questions: [
      { questionId: '10', order: 1, marks: 2 },
      { questionId: '15', order: 2, marks: 2 },
    ],
    totalQuestions: 2,
    totalMarks: 4,
    passingMarks: 2,
    passingPercentage: 40,
    timeLimitMinutes: 15,
    maxAttempts: 2,
    shuffleQuestions: false,
    shuffleOptions: false,
    status: 'Draft',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05',
  },
];

// --- mock quiz schedules ---
const MOCK_SCHEDULES: QuizSchedule[] = [
  {
    id: '1',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment - Data Structures',
    moduleCode: 'IT2040',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    maxAttempts: 1,
    resultVisibility: 'AfterWindow',
    status: 'Published',
    questionCount: 25,
    questionType: 'MCQ',
  },
  {
    id: '2',
    quizId: '2',
    quizTitle: 'Unit 3 - OOP Analysis Quiz',
    moduleCode: 'IT1040',
    startDate: '',
    endDate: '',
    maxAttempts: 2,
    resultVisibility: 'Immediate',
    status: 'Draft',
    questionCount: 15,
    questionType: 'MCQ',
  },
  {
    id: '3',
    quizId: '3',
    quizTitle: 'Database Fundamentals Quiz',
    moduleCode: 'IT3030',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    maxAttempts: 1,
    resultVisibility: 'Manual',
    status: 'Scheduled',
    questionCount: 20,
    questionType: 'MCQ',
  },
];

// --- mock submissions for tracking ---
const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: '1',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment',
    quizRef: 'QZ-IT2040-01',
    studentId: 'IT23201001',
    studentName: 'Kavinda Perera',
    studentAvatar: 'KP',
    avatarColor: 'bg-secondary-container',
    moduleCode: 'IT2040',
    attemptNumber: 1,
    answers: [],
    score: 20,
    totalMarks: 25,
    percentage: 80,
    status: 'Submitted',
    startedAt: '2026-03-10 09:00',
    submittedAt: '2026-03-10 09:45',
    timeTakenMinutes: 45,
  },
  {
    id: '2',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment',
    quizRef: 'QZ-IT2040-01',
    studentId: 'IT23201002',
    studentName: 'Nimali Fernando',
    studentAvatar: 'NF',
    avatarColor: 'bg-tertiary-fixed',
    moduleCode: 'IT2040',
    attemptNumber: 1,
    answers: [],
    score: 0,
    totalMarks: 25,
    percentage: 0,
    status: 'In Progress',
    startedAt: '2026-03-10 10:15',
    submittedAt: '',
    timeTakenMinutes: 0,
  },
  {
    id: '3',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment',
    quizRef: 'QZ-IT2040-01',
    studentId: 'IT23201003',
    studentName: 'Tharindu Jayasekara',
    studentAvatar: 'TJ',
    avatarColor: 'bg-surface-container-high',
    moduleCode: 'IT2040',
    attemptNumber: 0,
    answers: [],
    score: 0,
    totalMarks: 25,
    percentage: 0,
    status: 'Not Attempted',
    startedAt: '',
    submittedAt: '',
    timeTakenMinutes: 0,
  },
  {
    id: '4',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment',
    quizRef: 'QZ-IT2040-01',
    studentId: 'IT23201004',
    studentName: 'Sachini Wijesekara',
    studentAvatar: 'SW',
    avatarColor: 'bg-primary-fixed',
    moduleCode: 'IT2040',
    attemptNumber: 1,
    answers: [],
    score: 22,
    totalMarks: 25,
    percentage: 88,
    status: 'Submitted',
    startedAt: '2026-03-10 09:30',
    submittedAt: '2026-03-10 10:20',
    timeTakenMinutes: 50,
  },
  {
    id: '5',
    quizId: '3',
    quizTitle: 'Database Fundamentals',
    quizRef: 'QZ-IT3030-01',
    studentId: 'IT23201005',
    studentName: 'Amaya Rathnayake',
    studentAvatar: 'AR',
    avatarColor: 'bg-secondary-container',
    moduleCode: 'IT3030',
    attemptNumber: 1,
    answers: [],
    score: 10,
    totalMarks: 13,
    percentage: 77,
    status: 'Submitted',
    startedAt: '2026-03-20 14:00',
    submittedAt: '2026-03-20 14:30',
    timeTakenMinutes: 30,
  },
  {
    id: '6',
    quizId: '3',
    quizTitle: 'Database Fundamentals',
    quizRef: 'QZ-IT3030-01',
    studentId: 'IT23201006',
    studentName: 'Dinesh Kumara',
    studentAvatar: 'DK',
    avatarColor: 'bg-tertiary-fixed',
    moduleCode: 'IT3030',
    attemptNumber: 0,
    answers: [],
    score: 0,
    totalMarks: 13,
    percentage: 0,
    status: 'Not Attempted',
    startedAt: '',
    submittedAt: '',
    timeTakenMinutes: 0,
  },
  {
    id: '7',
    quizId: '4',
    quizTitle: 'Final Revision - SQA',
    quizRef: 'QZ-IT4020-01',
    studentId: 'IT23201001',
    studentName: 'Kavinda Perera',
    studentAvatar: 'KP',
    avatarColor: 'bg-secondary-container',
    moduleCode: 'IT4020',
    attemptNumber: 2,
    answers: [],
    score: 3,
    totalMarks: 3,
    percentage: 100,
    status: 'Submitted',
    startedAt: '2026-03-05 11:00',
    submittedAt: '2026-03-05 11:15',
    timeTakenMinutes: 15,
  },
  {
    id: '8',
    quizId: '4',
    quizTitle: 'Final Revision - SQA',
    quizRef: 'QZ-IT4020-01',
    studentId: 'IT23201007',
    studentName: 'Hasini De Silva',
    studentAvatar: 'HD',
    avatarColor: 'bg-primary-fixed',
    moduleCode: 'IT4020',
    attemptNumber: 1,
    answers: [],
    score: 2,
    totalMarks: 3,
    percentage: 67,
    status: 'Submitted',
    startedAt: '2026-03-05 13:00',
    submittedAt: '2026-03-05 13:10',
    timeTakenMinutes: 10,
  },
  {
    id: '9',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment',
    quizRef: 'QZ-IT2040-01',
    studentId: 'IT23201008',
    studentName: 'Ravindu Bandara',
    studentAvatar: 'RB',
    avatarColor: 'bg-surface-container-high',
    moduleCode: 'IT2040',
    attemptNumber: 1,
    answers: [],
    score: 15,
    totalMarks: 25,
    percentage: 60,
    status: 'Submitted',
    startedAt: '2026-03-10 09:00',
    submittedAt: '2026-03-10 09:55',
    timeTakenMinutes: 55,
  },
  {
    id: '10',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment',
    quizRef: 'QZ-IT2040-01',
    studentId: 'IT23201009',
    studentName: 'Ishara Wickramasinghe',
    studentAvatar: 'IW',
    avatarColor: 'bg-tertiary-fixed',
    moduleCode: 'IT2040',
    attemptNumber: 1,
    answers: [],
    score: 8,
    totalMarks: 25,
    percentage: 32,
    status: 'Submitted',
    startedAt: '2026-03-10 09:00',
    submittedAt: '2026-03-10 09:40',
    timeTakenMinutes: 40,
  },
];

// --- mock attempt history ---
const MOCK_ATTEMPTS: AttemptSummary[] = [
  {
    id: '1',
    quizId: '1',
    quizTitle: 'Mid-Semester Assessment - Data Structures',
    quizRef: 'QZ-2040-001',
    moduleCode: 'IT2040',
    attemptNumber: 1,
    score: 20,
    totalMarks: 25,
    percentage: 80,
    submittedAt: '2026-03-10',
    timeTakenMinutes: 45,
    status: 'Graded',
  },
  {
    id: '2',
    quizId: '3',
    quizTitle: 'Database Fundamentals Quiz',
    quizRef: 'QZ-3030-001',
    moduleCode: 'IT3030',
    attemptNumber: 1,
    score: 10,
    totalMarks: 13,
    percentage: 77,
    submittedAt: '2026-03-20',
    timeTakenMinutes: 30,
    status: 'Graded',
  },
  {
    id: '3',
    quizId: '4',
    quizTitle: 'Final Revision - SQA',
    quizRef: 'QZ-4020-001',
    moduleCode: 'IT4020',
    attemptNumber: 1,
    score: 1,
    totalMarks: 3,
    percentage: 33,
    submittedAt: '2026-03-05',
    timeTakenMinutes: 18,
    status: 'Pending Review',
  },
  {
    id: '4',
    quizId: '4',
    quizTitle: 'Final Revision - SQA',
    quizRef: 'QZ-4020-001',
    moduleCode: 'IT4020',
    attemptNumber: 2,
    score: 3,
    totalMarks: 3,
    percentage: 100,
    submittedAt: '2026-03-05',
    timeTakenMinutes: 15,
    status: 'Graded',
  },
  {
    id: '5',
    quizId: '5',
    quizTitle: 'Web Development Basics',
    quizRef: 'QZ-2080-001',
    moduleCode: 'IT2080',
    attemptNumber: 1,
    score: 0,
    totalMarks: 4,
    percentage: 0,
    submittedAt: '',
    timeTakenMinutes: 0,
    status: 'In Progress',
  },
];

// --- mock learning resources ---
const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Binary Search Algorithm Explained',
    description: 'Step by step video explaining binary search with examples.',
    type: 'Video',
    url: 'https://example.com/binary-search',
    topic: 'Asymptotic Analysis',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
  },
  {
    id: '2',
    title: 'SQL Joins Cheat Sheet',
    description: 'PDF document with visual diagrams of all SQL JOIN types.',
    type: 'PDF',
    url: 'https://example.com/sql-joins.pdf',
    topic: 'Database Queries',
    module: 'Database Management Systems',
    moduleCode: 'IT3030',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
  },
  {
    id: '3',
    title: 'OOP Concepts - GeeksforGeeks',
    description: 'Comprehensive article covering all OOP concepts with code examples.',
    type: 'Article',
    url: 'https://example.com/oop-concepts',
    topic: 'OOP Fundamentals',
    module: 'Object Oriented Programming',
    moduleCode: 'IT1040',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
  },
  {
    id: '4',
    title: 'Graph Algorithms Playlist',
    description: 'YouTube playlist covering BFS, DFS, Dijkstra, and more.',
    type: 'Video',
    url: 'https://example.com/graph-playlist',
    topic: 'Graph Algorithms',
    module: 'Data Structures & Algorithms',
    moduleCode: 'IT2040',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10',
  },
  {
    id: '5',
    title: 'REST API Design Best Practices',
    description: 'Article on how to design clean REST APIs with examples.',
    type: 'Article',
    url: 'https://example.com/rest-api',
    topic: 'Web Fundamentals',
    module: 'Web Application Development',
    moduleCode: 'IT2080',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15',
  },
];

// ============================================
// READINESS SERVICE
// handles all data operations for the readiness module
// right now uses mock data - will switch to real API in Stage 2
// ============================================

@Injectable({
  providedIn: 'root',
})
export class ReadinessService {
  // signals to hold the current data state
  questions = signal<Question[]>(MOCK_QUESTIONS);
  quizzes = signal<Quiz[]>(MOCK_QUIZZES);
  submissions = signal<Submission[]>(MOCK_SUBMISSIONS);

  // ---------- QUESTION METHODS ----------

  // get all questions, optionally filtered
  getQuestions(filter?: QuestionFilter): Observable<Question[]> {
    let result = [...MOCK_QUESTIONS];

    if (filter) {
      // filter by search text
      if (filter.search) {
        const search = filter.search.toLowerCase();
        result = result.filter(
          (q) =>
            q.title.toLowerCase().includes(search) ||
            q.questionId.toLowerCase().includes(search) ||
            q.module.toLowerCase().includes(search)
        );
      }

      // filter by module
      if (filter.module) {
        result = result.filter((q) => q.module === filter.module);
      }

      // filter by topic
      if (filter.topic) {
        result = result.filter((q) => q.topic === filter.topic);
      }

      // filter by difficulty
      if (filter.difficulty) {
        result = result.filter((q) => q.difficulty === filter.difficulty);
      }

      // filter by status
      if (filter.status) {
        result = result.filter((q) => q.status === filter.status);
      }
    }

    // simulate API delay
    return of(result).pipe(delay(300));
  }

  // get a single question by id
  getQuestionById(id: string): Observable<Question | undefined> {
    const question = MOCK_QUESTIONS.find((q) => q.id === id);
    return of(question).pipe(delay(200));
  }

  // create a new question
  createQuestion(question: Partial<Question>): Observable<Question> {
    const newQuestion: Question = {
      id: String(MOCK_QUESTIONS.length + 1),
      questionId: `QB-3040-${String(MOCK_QUESTIONS.length + 1).padStart(3, '0')}`,
      title: question.title || '',
      questionText: question.questionText || '',
      questionType: question.questionType || 'MCQ',
      difficulty: question.difficulty || 'Easy',
      topic: question.topic || '',
      module: question.module || '',
      moduleCode: question.moduleCode || '',
      options: question.options || [],
      correctOptionId: question.correctOptionId || '',
      explanation: question.explanation || '',
      marks: question.marks || 0,
      status: question.status || 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    MOCK_QUESTIONS.push(newQuestion);
    this.questions.set([...MOCK_QUESTIONS]);
    return of(newQuestion).pipe(delay(300));
  }

  // update an existing question
  updateQuestion(id: string, updates: Partial<Question>): Observable<Question> {
    const index = MOCK_QUESTIONS.findIndex((q) => q.id === id);
    if (index !== -1) {
      MOCK_QUESTIONS[index] = { ...MOCK_QUESTIONS[index], ...updates };
      this.questions.set([...MOCK_QUESTIONS]);
    }
    return of(MOCK_QUESTIONS[index]).pipe(delay(300));
  }

  // delete a question by id
  deleteQuestion(id: string): Observable<boolean> {
    const index = MOCK_QUESTIONS.findIndex((q) => q.id === id);
    if (index !== -1) {
      MOCK_QUESTIONS.splice(index, 1);
      this.questions.set([...MOCK_QUESTIONS]);
    }
    return of(true).pipe(delay(300));
  }

  // get all unique modules (for dropdown filters)
  getModules(): string[] {
    const modules = MOCK_QUESTIONS.map((q) => q.module);
    return [...new Set(modules)];
  }

  // get all unique topics (for dropdown filters)
  getTopics(): string[] {
    const topics = MOCK_QUESTIONS.map((q) => q.topic);
    return [...new Set(topics)];
  }

  // ---------- QUIZ METHODS ----------

  // get all quizzes
  getQuizzes(): Observable<Quiz[]> {
    return of([...MOCK_QUIZZES]).pipe(delay(300));
  }

  // get a single quiz by id
  getQuizById(id: string): Observable<Quiz | undefined> {
    const quiz = MOCK_QUIZZES.find((q) => q.id === id);
    return of(quiz).pipe(delay(200));
  }

  // create a new quiz
  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    const newQuiz: Quiz = {
      id: String(MOCK_QUIZZES.length + 1),
      title: quiz.title || '',
      description: quiz.description || '',
      module: quiz.module || '',
      moduleCode: quiz.moduleCode || '',
      intake: quiz.intake || '',
      questions: quiz.questions || [],
      totalQuestions: quiz.questions?.length || 0,
      totalMarks: quiz.totalMarks || 0,
      passingMarks: quiz.passingMarks || 0,
      passingPercentage: quiz.passingPercentage || 40,
      timeLimitMinutes: quiz.timeLimitMinutes || 60,
      maxAttempts: quiz.maxAttempts || 1,
      shuffleQuestions: quiz.shuffleQuestions || false,
      shuffleOptions: quiz.shuffleOptions || false,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    MOCK_QUIZZES.push(newQuiz);
    this.quizzes.set([...MOCK_QUIZZES]);
    return of(newQuiz).pipe(delay(300));
  }

  // ---------- SCHEDULE METHODS ----------

  // get all quiz schedules
  getSchedules(): Observable<QuizSchedule[]> {
    return of([...MOCK_SCHEDULES]).pipe(delay(300));
  }

  // update a schedule (publish, set dates, etc.)
  updateSchedule(id: string, updates: Partial<QuizSchedule>): Observable<QuizSchedule> {
    const index = MOCK_SCHEDULES.findIndex((s) => s.id === id);
    if (index !== -1) {
      MOCK_SCHEDULES[index] = { ...MOCK_SCHEDULES[index], ...updates };
    }
    return of(MOCK_SCHEDULES[index]).pipe(delay(300));
  }

  // ---------- SUBMISSION METHODS ----------

  // get submissions, optionally filtered by quiz
  getSubmissions(quizId?: string): Observable<Submission[]> {
    let result = [...MOCK_SUBMISSIONS];
    if (quizId) {
      result = result.filter((s) => s.quizId === quizId);
    }
    return of(result).pipe(delay(300));
  }

  // get submission stats for a quiz
  getSubmissionStats(quizId?: string): Observable<SubmissionStats> {
    const subs = quizId
      ? MOCK_SUBMISSIONS.filter((s) => s.quizId === quizId)
      : MOCK_SUBMISSIONS;

    const submitted = subs.filter((s) => s.status === 'Submitted').length;
    const inProgress = subs.filter((s) => s.status === 'In Progress').length;
    const notAttempted = subs.filter((s) => s.status === 'Not Attempted').length;
    const total = subs.length;

    const stats: SubmissionStats = {
      totalCompletionRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
      inProgressCount: inProgress,
      pendingReminders: notAttempted,
      totalEnrollments: total,
    };

    return of(stats).pipe(delay(200));
  }

  // submit a quiz attempt (student side)
  submitQuiz(quizId: string, answers: { questionId: string; selectedOptionId: string }[]): Observable<Submission> {
    // calculate score based on correct answers
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const question = MOCK_QUESTIONS.find((q) => q.id === a.questionId);
      const isCorrect = question?.correctOptionId === a.selectedOptionId;
      const marks = isCorrect ? (question?.marks || 0) : 0;
      if (isCorrect) score += marks;
      return { ...a, isCorrect, marks };
    });

    const submission: Submission = {
      id: String(MOCK_SUBMISSIONS.length + 1),
      quizId,
      quizTitle: quiz?.title || '',
      quizRef: `QZ-${quiz?.moduleCode}-01`,
      studentId: 'IT23201996',
      studentName: 'K.B.C Dilshani',
      studentAvatar: 'CD',
      avatarColor: 'bg-primary-fixed',
      moduleCode: quiz?.moduleCode || '',
      attemptNumber: 1,
      answers: gradedAnswers,
      score,
      totalMarks: quiz?.totalMarks || 0,
      percentage: quiz?.totalMarks ? Math.round((score / quiz.totalMarks) * 100) : 0,
      status: 'Submitted',
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      timeTakenMinutes: 0,
    };

    MOCK_SUBMISSIONS.push(submission);
    this.submissions.set([...MOCK_SUBMISSIONS]);
    return of(submission).pipe(delay(500));
  }

  // ---------- ATTEMPT HISTORY METHODS ----------

  // get attempt history
  getAttemptHistory(): Observable<AttemptSummary[]> {
    return of([...MOCK_ATTEMPTS]).pipe(delay(300));
  }

  // get attempt stats
  getAttemptStats(): Observable<AttemptStats> {
    const stats: AttemptStats = {
      totalAttempts: 1482,
      avgSuccessRate: 76.4,
      flaggedAttempts: 24,
      changePercentage: 12,
    };
    return of(stats).pipe(delay(200));
  }

  // ---------- RESOURCE METHODS ----------

  // get all learning resources
  getResources(): Observable<Resource[]> {
    return of([...MOCK_RESOURCES]).pipe(delay(300));
  }

  // get questions for a specific quiz (for quiz attempt page)
  getQuizQuestions(quizId: string): Observable<Question[]> {
    const quiz = MOCK_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) return of([]);

    const questions = quiz.questions
      .map((qq) => MOCK_QUESTIONS.find((q) => q.id === qq.questionId))
      .filter((q): q is Question => q !== undefined);

    return of(questions).pipe(delay(300));
  }
}
