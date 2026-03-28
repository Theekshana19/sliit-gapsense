using GapSense.Domain.Entities;

namespace GapSense.Infrastructure.Data;

// seed data - populates the database with sample data when it's first created
// this is the same data we used as mock data in the frontend
// call SeedData.Initialize() from Program.cs on startup
public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        // only seed if the database is empty (no modules yet)
        if (db.Modules.Any())
            return;

        // --- create modules ---
        var modules = new List<Module>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111101"), ModuleCode = "IT1040", ModuleName = "Object Oriented Programming", Description = "Introduction to OOP concepts including classes, objects, inheritance, polymorphism and encapsulation.", Program = "BSc IT", Semester = "Y1S2", Credits = 4, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111102"), ModuleCode = "IT2040", ModuleName = "Data Structures & Algorithms", Description = "Covers arrays, linked lists, stacks, queues, trees, graphs, sorting and searching algorithms.", Program = "BSc IT", Semester = "Y2S1", Credits = 4, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111103"), ModuleCode = "IT2080", ModuleName = "Web Application Development", Description = "Building modern web applications with HTML, CSS, JavaScript and frameworks.", Program = "BSc IT", Semester = "Y2S1", Credits = 3, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111104"), ModuleCode = "IT3030", ModuleName = "Database Management Systems", Description = "Relational databases, SQL, normalization, transactions and database design.", Program = "BSc IT", Semester = "Y2S2", Credits = 4, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111105"), ModuleCode = "IT3011", ModuleName = "Software Engineering", Description = "Software development lifecycle, design patterns, agile methods and project management.", Program = "BSc IT", Semester = "Y3S1", Credits = 3, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111106"), ModuleCode = "IT4020", ModuleName = "Software Quality Assurance", Description = "Testing methodologies, quality models, test automation and quality metrics.", Program = "BSc IT", Semester = "Y3S2", Credits = 3, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111107"), ModuleCode = "IT3040", ModuleName = "IT Project Management", Description = "Project planning, scheduling, risk management and team collaboration.", Program = "BSc IT", Semester = "Y3S1", Credits = 3, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111108"), ModuleCode = "CS2050", ModuleName = "Computer Architecture", Description = "CPU design, memory hierarchy, instruction sets and assembly programming.", Program = "BSc CS", Semester = "Y2S1", Credits = 4, Status = "Draft" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111109"), ModuleCode = "SE3020", ModuleName = "Distributed Systems", Description = "Distributed computing concepts, microservices, cloud computing and containerization.", Program = "BSc SE", Semester = "Y3S1", Credits = 4, Status = "Active" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111110"), ModuleCode = "DS1010", ModuleName = "Introduction to Data Science", Description = "Basics of data analysis, statistics, Python for data science and visualization.", Program = "BSc DS", Semester = "Y1S1", Credits = 3, Status = "Draft" },
        };

        db.Modules.AddRange(modules);
        db.SaveChanges();

        // --- create topics for IT2040 (Data Structures) ---
        var topicsDsa = new List<Topic>
        {
            new() { ModuleId = modules[1].Id, TopicName = "Asymptotic Analysis", Description = "Big-O, Big-Omega, Big-Theta notations and time complexity analysis.", Weight = 15, ImportanceLevel = "Critical", Status = "Validated" },
            new() { ModuleId = modules[1].Id, TopicName = "Linear Data Structures", Description = "Arrays, linked lists, stacks and queues with their operations.", Weight = 20, ImportanceLevel = "High", Status = "Validated" },
            new() { ModuleId = modules[1].Id, TopicName = "Trees & Binary Trees", Description = "Binary trees, BST, AVL trees, tree traversals and heap data structure.", Weight = 18, ImportanceLevel = "High", Status = "Validated" },
            new() { ModuleId = modules[1].Id, TopicName = "Graph Algorithms", Description = "Graph representations, BFS, DFS, shortest path and spanning trees.", Weight = 20, ImportanceLevel = "Critical", Status = "Validated" },
            new() { ModuleId = modules[1].Id, TopicName = "Sorting Algorithms", Description = "Bubble, selection, insertion, merge, quick sort and their complexities.", Weight = 15, ImportanceLevel = "Medium", Status = "Validated" },
            new() { ModuleId = modules[1].Id, TopicName = "Recursion", Description = "Recursive thinking, base cases, recursive algorithms and dynamic programming intro.", Weight = 8, ImportanceLevel = "Medium", Status = "Draft" },
            new() { ModuleId = modules[1].Id, TopicName = "Hashing", Description = "Hash tables, hash functions, collision resolution techniques.", Weight = 4, ImportanceLevel = "Low", Status = "Draft", IsActive = false },
        };

        // --- topics for IT3030 (DBMS) ---
        var topicsDbms = new List<Topic>
        {
            new() { ModuleId = modules[3].Id, TopicName = "Database Design", Description = "ER diagrams, relational model and schema design.", Weight = 25, ImportanceLevel = "Critical", Status = "Validated" },
            new() { ModuleId = modules[3].Id, TopicName = "Database Queries", Description = "SQL SELECT, JOIN, subqueries, aggregation and views.", Weight = 30, ImportanceLevel = "Critical", Status = "Validated" },
            new() { ModuleId = modules[3].Id, TopicName = "Normalization", Description = "1NF, 2NF, 3NF, BCNF and denormalization strategies.", Weight = 20, ImportanceLevel = "High", Status = "Validated" },
            new() { ModuleId = modules[3].Id, TopicName = "Database Transactions", Description = "ACID properties, concurrency control and recovery.", Weight = 25, ImportanceLevel = "High", Status = "Validated" },
        };

        // --- topics for IT1040 (OOP) ---
        var topicsOop = new List<Topic>
        {
            new() { ModuleId = modules[0].Id, TopicName = "OOP Fundamentals", Description = "Classes, objects, methods, constructors and access modifiers.", Weight = 30, ImportanceLevel = "Critical", Status = "Validated" },
            new() { ModuleId = modules[0].Id, TopicName = "Inheritance & Polymorphism", Description = "Inheritance hierarchies, method overriding, abstract classes and interfaces.", Weight = 30, ImportanceLevel = "Critical", Status = "Validated" },
            new() { ModuleId = modules[0].Id, TopicName = "Exception Handling", Description = "Try-catch blocks, custom exceptions and error handling strategies.", Weight = 20, ImportanceLevel = "Medium", Status = "Validated" },
            new() { ModuleId = modules[0].Id, TopicName = "Collections Framework", Description = "Lists, sets, maps and iterators.", Weight = 20, ImportanceLevel = "Medium", Status = "Draft" },
        };

        db.Topics.AddRange(topicsDsa);
        db.Topics.AddRange(topicsDbms);
        db.Topics.AddRange(topicsOop);
        db.SaveChanges();

        // --- create prerequisites ---
        var prerequisites = new List<Prerequisite>
        {
            // IT2040 requires IT1040 (DSA needs OOP)
            new() { MainModuleId = modules[1].Id, PrerequisiteModuleId = modules[0].Id, RelationshipType = "Mandatory", RelevanceWeight = 90, Notes = "OOP concepts are essential for understanding data structure implementations.", Status = "Validated" },
            // IT2080 requires IT1040 (Web dev needs OOP)
            new() { MainModuleId = modules[2].Id, PrerequisiteModuleId = modules[0].Id, RelationshipType = "Mandatory", RelevanceWeight = 75, Notes = "Basic programming knowledge required for web development.", Status = "Validated" },
            // IT3030 optionally requires IT1040 (DBMS can use OOP)
            new() { MainModuleId = modules[3].Id, PrerequisiteModuleId = modules[0].Id, RelationshipType = "Optional", RelevanceWeight = 50, Notes = "Basic programming helps with understanding SQL and database concepts.", Status = "Validated" },
            // IT3011 requires IT2040 (SE needs DSA)
            new() { MainModuleId = modules[4].Id, PrerequisiteModuleId = modules[1].Id, RelationshipType = "Mandatory", RelevanceWeight = 80, Notes = "DSA knowledge needed for understanding design patterns and system design.", Status = "Validated" },
            // IT3011 optionally requires IT2080 (SE can use Web dev)
            new() { MainModuleId = modules[4].Id, PrerequisiteModuleId = modules[2].Id, RelationshipType = "Optional", RelevanceWeight = 60, Notes = "Web dev experience helpful for software engineering projects.", Status = "Review Required" },
            // IT4020 requires IT3011 (QA needs SE)
            new() { MainModuleId = modules[5].Id, PrerequisiteModuleId = modules[4].Id, RelationshipType = "Mandatory", RelevanceWeight = 95, Notes = "SE concepts are foundational for understanding quality assurance.", Status = "Validated" },
            // IT4020 optionally requires IT3030 (QA can use DBMS)
            new() { MainModuleId = modules[5].Id, PrerequisiteModuleId = modules[3].Id, RelationshipType = "Optional", RelevanceWeight = 40, Notes = "Database knowledge helps with testing data-driven applications.", Status = "Validated" },
            // SE3020 requires IT2040 (Distributed Systems needs DSA)
            new() { MainModuleId = modules[8].Id, PrerequisiteModuleId = modules[1].Id, RelationshipType = "Mandatory", RelevanceWeight = 85, Notes = "DSA fundamentals needed for distributed algorithm design.", Status = "Validated" },
        };

        db.Prerequisites.AddRange(prerequisites);
        db.SaveChanges();

        // --- create semester offerings ---
        var offerings = new List<SemesterOffering>
        {
            new() { ModuleId = modules[0].Id, Program = "BSc IT", Intake = "February 2024", Semester = "Y1S2", LecturerName = "Dr. Kamal Perera", LecturerAvatar = "KP", AvatarColor = "bg-primary-fixed", Status = "Published" },
            new() { ModuleId = modules[1].Id, Program = "BSc IT", Intake = "February 2024", Semester = "Y2S1", LecturerName = "Dr. Aruna Perera", LecturerAvatar = "AP", AvatarColor = "bg-secondary-container", Status = "Published" },
            new() { ModuleId = modules[3].Id, Program = "BSc IT", Intake = "February 2024", Semester = "Y2S2", LecturerName = "Ms. Nishani Silva", LecturerAvatar = "NS", AvatarColor = "bg-tertiary-fixed", Status = "Published" },
            new() { ModuleId = modules[7].Id, Program = "BSc CS", Intake = "June 2024", Semester = "Y2S1", LecturerName = "Prof. Ruwan Fernando", LecturerAvatar = "RF", AvatarColor = "bg-surface-container-high", Status = "Draft" },
            new() { ModuleId = modules[4].Id, Program = "BSc IT", Intake = "February 2024", Semester = "Y3S1", LecturerName = "Dr. Tharaka Jayasinghe", LecturerAvatar = "TJ", AvatarColor = "bg-primary-fixed", Status = "Published" },
            new() { ModuleId = modules[9].Id, Program = "BSc DS", Intake = "October 2024", Semester = "Y1S1", LecturerName = "Dr. Malini Rathnayake", LecturerAvatar = "MR", AvatarColor = "bg-secondary-container", Status = "Inactive" },
        };

        db.SemesterOfferings.AddRange(offerings);
        db.SaveChanges();

        // --- create validation alerts ---
        var alerts = new List<ValidationAlert>
        {
            new() { Type = "Incomplete Setup", ModuleCode = "CS2050", ModuleName = "Computer Architecture", Severity = "Critical", Description = "Module CS2050 has no topics configured yet. Cannot calculate readiness without topics.", Status = "Unresolved" },
            new() { Type = "Missing Topic Weight", ModuleCode = "IT2040", ModuleName = "Data Structures & Algorithms", Severity = "Warning", Description = "Topic 'Hashing' has only 4% weight. Very low weight may not contribute meaningfully to readiness scoring.", Status = "In Progress" },
            new() { Type = "Duplicate Mapping", ModuleCode = "IT2080", ModuleName = "Web Application Development", Severity = "Warning", Description = "Review prerequisite mapping for IT2080 — check if IT1040 relationship type is correct.", Status = "In Progress" },
            new() { Type = "Incomplete Setup", ModuleCode = "DS1010", ModuleName = "Introduction to Data Science", Severity = "Info", Description = "Module DS1010 has no topics configured yet. Add topics to complete setup.", Status = "Unresolved" },
            new() { Type = "Missing Topic Weight", ModuleCode = "IT3040", ModuleName = "IT Project Management", Severity = "Warning", Description = "Module IT3040 has no topics configured. Topic weights cannot be calculated.", Status = "Unresolved" },
        };

        db.ValidationAlerts.AddRange(alerts);
        db.SaveChanges();

        // ============================
        // CHAMODI'S SEED DATA (Readiness module)
        // ============================
        SeedReadinessData(db, modules);
    }

    // seed questions, quizzes, schedules, submissions, and resources
    private static void SeedReadinessData(AppDbContext db, List<Module> modules)
    {
        // skip if questions already exist
        if (db.Questions.Any()) return;

        // get topic IDs we need (from IT2040 - Data Structures)
        var topicsDsa = db.Topics.Where(t => t.ModuleId == modules[1].Id).ToList();
        var topicsOop = db.Topics.Where(t => t.ModuleId == modules[0].Id).ToList();
        var topicsDbms = db.Topics.Where(t => t.ModuleId == modules[3].Id).ToList();

        // --- create questions for IT2040 (Data Structures) ---
        var questions = new List<Question>();

        // Question 1
        var q1 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222201"),
            QuestionDisplayId = "QB-IT2040-001",
            Title = "Time Complexity of Binary Search",
            QuestionText = "What is the time complexity of binary search algorithm in the worst case?",
            QuestionType = "MCQ",
            Difficulty = "Easy",
            ModuleId = modules[1].Id,
            TopicId = topicsDsa.FirstOrDefault(t => t.TopicName == "Asymptotic Analysis")?.Id,
            Explanation = "Binary search divides the search space in half each time, giving O(log n) complexity.",
            Marks = 5,
            Status = "Active",
        };
        q1.Options.Add(new QuestionOption { OptionText = "O(n)", IsCorrect = false, SortOrder = 0 });
        q1.Options.Add(new QuestionOption { OptionText = "O(log n)", IsCorrect = true, SortOrder = 1 });
        q1.Options.Add(new QuestionOption { OptionText = "O(n log n)", IsCorrect = false, SortOrder = 2 });
        q1.Options.Add(new QuestionOption { OptionText = "O(1)", IsCorrect = false, SortOrder = 3 });
        questions.Add(q1);

        // Question 2
        var q2 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222202"),
            QuestionDisplayId = "QB-IT2040-002",
            Title = "Stack Data Structure",
            QuestionText = "Which principle does a Stack data structure follow?",
            QuestionType = "MCQ",
            Difficulty = "Easy",
            ModuleId = modules[1].Id,
            TopicId = topicsDsa.FirstOrDefault(t => t.TopicName == "Linear Data Structures")?.Id,
            Explanation = "Stack follows LIFO - the last element added is the first one removed.",
            Marks = 5,
            Status = "Active",
        };
        q2.Options.Add(new QuestionOption { OptionText = "FIFO (First In, First Out)", IsCorrect = false, SortOrder = 0 });
        q2.Options.Add(new QuestionOption { OptionText = "LIFO (Last In, First Out)", IsCorrect = true, SortOrder = 1 });
        q2.Options.Add(new QuestionOption { OptionText = "Random Access", IsCorrect = false, SortOrder = 2 });
        q2.Options.Add(new QuestionOption { OptionText = "Priority Based", IsCorrect = false, SortOrder = 3 });
        questions.Add(q2);

        // Question 3
        var q3 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222203"),
            QuestionDisplayId = "QB-IT2040-003",
            Title = "BST Traversal",
            QuestionText = "Which tree traversal method visits nodes in ascending order for a Binary Search Tree?",
            QuestionType = "MCQ",
            Difficulty = "Medium",
            ModuleId = modules[1].Id,
            TopicId = topicsDsa.FirstOrDefault(t => t.TopicName == "Trees & Binary Trees")?.Id,
            Explanation = "In-order traversal of a BST visits left subtree, root, then right subtree, resulting in sorted order.",
            Marks = 10,
            Status = "Active",
        };
        q3.Options.Add(new QuestionOption { OptionText = "Pre-order", IsCorrect = false, SortOrder = 0 });
        q3.Options.Add(new QuestionOption { OptionText = "In-order", IsCorrect = true, SortOrder = 1 });
        q3.Options.Add(new QuestionOption { OptionText = "Post-order", IsCorrect = false, SortOrder = 2 });
        q3.Options.Add(new QuestionOption { OptionText = "Level-order", IsCorrect = false, SortOrder = 3 });
        questions.Add(q3);

        // Question 4
        var q4 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222204"),
            QuestionDisplayId = "QB-IT2040-004",
            Title = "Graph BFS Algorithm",
            QuestionText = "Which data structure is primarily used in Breadth-First Search (BFS)?",
            QuestionType = "MCQ",
            Difficulty = "Medium",
            ModuleId = modules[1].Id,
            TopicId = topicsDsa.FirstOrDefault(t => t.TopicName == "Graph Algorithms")?.Id,
            Explanation = "BFS uses a Queue to explore nodes level by level.",
            Marks = 10,
            Status = "Active",
        };
        q4.Options.Add(new QuestionOption { OptionText = "Stack", IsCorrect = false, SortOrder = 0 });
        q4.Options.Add(new QuestionOption { OptionText = "Queue", IsCorrect = true, SortOrder = 1 });
        q4.Options.Add(new QuestionOption { OptionText = "Heap", IsCorrect = false, SortOrder = 2 });
        q4.Options.Add(new QuestionOption { OptionText = "Linked List", IsCorrect = false, SortOrder = 3 });
        questions.Add(q4);

        // Question 5
        var q5 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222205"),
            QuestionDisplayId = "QB-IT2040-005",
            Title = "Quick Sort Worst Case",
            QuestionText = "What is the worst-case time complexity of Quick Sort?",
            QuestionType = "MCQ",
            Difficulty = "Hard",
            ModuleId = modules[1].Id,
            TopicId = topicsDsa.FirstOrDefault(t => t.TopicName == "Sorting Algorithms")?.Id,
            Explanation = "Quick Sort degrades to O(n²) when the pivot selection is poor (e.g., already sorted array).",
            Marks = 15,
            Status = "Active",
        };
        q5.Options.Add(new QuestionOption { OptionText = "O(n log n)", IsCorrect = false, SortOrder = 0 });
        q5.Options.Add(new QuestionOption { OptionText = "O(n)", IsCorrect = false, SortOrder = 1 });
        q5.Options.Add(new QuestionOption { OptionText = "O(n²)", IsCorrect = true, SortOrder = 2 });
        q5.Options.Add(new QuestionOption { OptionText = "O(log n)", IsCorrect = false, SortOrder = 3 });
        questions.Add(q5);

        // Question 6 - for IT1040 (OOP)
        var q6 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222206"),
            QuestionDisplayId = "QB-IT1040-001",
            Title = "OOP Encapsulation",
            QuestionText = "What is the main purpose of encapsulation in OOP?",
            QuestionType = "MCQ",
            Difficulty = "Easy",
            ModuleId = modules[0].Id,
            TopicId = topicsOop.FirstOrDefault(t => t.TopicName == "OOP Fundamentals")?.Id,
            Explanation = "Encapsulation hides internal data and provides controlled access through methods.",
            Marks = 5,
            Status = "Active",
        };
        q6.Options.Add(new QuestionOption { OptionText = "To make code run faster", IsCorrect = false, SortOrder = 0 });
        q6.Options.Add(new QuestionOption { OptionText = "To hide internal data and restrict access", IsCorrect = true, SortOrder = 1 });
        q6.Options.Add(new QuestionOption { OptionText = "To allow multiple inheritance", IsCorrect = false, SortOrder = 2 });
        q6.Options.Add(new QuestionOption { OptionText = "To reduce memory usage", IsCorrect = false, SortOrder = 3 });
        questions.Add(q6);

        // Question 7 - for IT3030 (DBMS)
        var q7 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222207"),
            QuestionDisplayId = "QB-IT3030-001",
            Title = "SQL JOIN Types",
            QuestionText = "Which JOIN returns all records from the left table and matched records from the right table?",
            QuestionType = "MCQ",
            Difficulty = "Medium",
            ModuleId = modules[3].Id,
            TopicId = topicsDbms.FirstOrDefault(t => t.TopicName == "Database Queries")?.Id,
            Explanation = "LEFT JOIN returns all rows from the left table, even if there's no match in the right table.",
            Marks = 10,
            Status = "Active",
        };
        q7.Options.Add(new QuestionOption { OptionText = "INNER JOIN", IsCorrect = false, SortOrder = 0 });
        q7.Options.Add(new QuestionOption { OptionText = "LEFT JOIN", IsCorrect = true, SortOrder = 1 });
        q7.Options.Add(new QuestionOption { OptionText = "RIGHT JOIN", IsCorrect = false, SortOrder = 2 });
        q7.Options.Add(new QuestionOption { OptionText = "CROSS JOIN", IsCorrect = false, SortOrder = 3 });
        questions.Add(q7);

        // Question 8
        var q8 = new Question
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222208"),
            QuestionDisplayId = "QB-IT2040-006",
            Title = "Hash Table Collision",
            QuestionText = "What happens when two different keys produce the same hash value in a hash table?",
            QuestionType = "MCQ",
            Difficulty = "Hard",
            ModuleId = modules[1].Id,
            TopicId = topicsDsa.FirstOrDefault(t => t.TopicName == "Hashing")?.Id,
            Explanation = "A collision occurs when two keys map to the same index. Techniques like chaining or open addressing resolve this.",
            Marks = 15,
            Status = "Active",
        };
        q8.Options.Add(new QuestionOption { OptionText = "The second key overwrites the first", IsCorrect = false, SortOrder = 0 });
        q8.Options.Add(new QuestionOption { OptionText = "A collision occurs and must be resolved", IsCorrect = true, SortOrder = 1 });
        q8.Options.Add(new QuestionOption { OptionText = "The hash table automatically resizes", IsCorrect = false, SortOrder = 2 });
        q8.Options.Add(new QuestionOption { OptionText = "An error is thrown", IsCorrect = false, SortOrder = 3 });
        questions.Add(q8);

        db.Questions.AddRange(questions);
        db.SaveChanges();

        // --- create a quiz for IT2040 ---
        var quiz1 = new Quiz
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333301"),
            Title = "Mid-Semester Assessment - Data Structures",
            Description = "Covers arrays, trees, graphs and sorting algorithms from weeks 1-6.",
            ModuleId = modules[1].Id,
            Intake = "February 2024",
            TotalMarks = 45,
            PassingPercentage = 40,
            TimeLimitMinutes = 45,
            MaxAttempts = 2,
            ShuffleQuestions = true,
            Status = "Published",
        };

        // add 5 DSA questions to this quiz
        quiz1.QuizQuestions.Add(new QuizQuestion { QuestionId = q1.Id, SortOrder = 1, Marks = 5 });
        quiz1.QuizQuestions.Add(new QuizQuestion { QuestionId = q2.Id, SortOrder = 2, Marks = 5 });
        quiz1.QuizQuestions.Add(new QuizQuestion { QuestionId = q3.Id, SortOrder = 3, Marks = 10 });
        quiz1.QuizQuestions.Add(new QuizQuestion { QuestionId = q4.Id, SortOrder = 4, Marks = 10 });
        quiz1.QuizQuestions.Add(new QuizQuestion { QuestionId = q5.Id, SortOrder = 5, Marks = 15 });

        // quiz for IT1040
        var quiz2 = new Quiz
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
            Title = "Unit 3 - OOP Analysis Quiz",
            Description = "Tests understanding of OOP fundamentals and encapsulation.",
            ModuleId = modules[0].Id,
            Intake = "February 2024",
            TotalMarks = 5,
            PassingPercentage = 40,
            TimeLimitMinutes = 15,
            MaxAttempts = 3,
            Status = "Draft",
        };

        quiz2.QuizQuestions.Add(new QuizQuestion { QuestionId = q6.Id, SortOrder = 1, Marks = 5 });

        db.Quizzes.AddRange(new[] { quiz1, quiz2 });
        db.SaveChanges();

        // --- create quiz schedules ---
        var schedule1 = new QuizSchedule
        {
            QuizId = quiz1.Id,
            StartDate = new DateTime(2026, 3, 10),
            EndDate = new DateTime(2026, 3, 12),
            MaxAttempts = 2,
            ResultVisibility = "Immediate",
            Status = "Published",
        };

        var schedule2 = new QuizSchedule
        {
            QuizId = quiz2.Id,
            StartDate = new DateTime(2026, 4, 1),
            EndDate = new DateTime(2026, 4, 5),
            MaxAttempts = 3,
            ResultVisibility = "AfterWindow",
            Status = "Scheduled",
        };

        db.QuizSchedules.AddRange(new[] { schedule1, schedule2 });
        db.SaveChanges();

        // --- create sample submissions ---
        var sub1 = new Submission
        {
            QuizId = quiz1.Id,
            StudentId = "IT23201996",
            StudentName = "Kaushal Perera",
            StudentAvatar = "KP",
            AvatarColor = "bg-primary-fixed",
            AttemptNumber = 1,
            Score = 35,
            TotalMarks = 45,
            Percentage = 77.78m,
            Status = "Graded",
            StartedAt = new DateTime(2026, 3, 10, 9, 0, 0),
            SubmittedAt = new DateTime(2026, 3, 10, 9, 38, 0),
            TimeTakenMinutes = 38,
        };

        var sub2 = new Submission
        {
            QuizId = quiz1.Id,
            StudentId = "IT23219816",
            StudentName = "Tharindu Rajapaksha",
            StudentAvatar = "TR",
            AvatarColor = "bg-secondary-container",
            AttemptNumber = 1,
            Score = 20,
            TotalMarks = 45,
            Percentage = 44.44m,
            Status = "Graded",
            StartedAt = new DateTime(2026, 3, 10, 10, 0, 0),
            SubmittedAt = new DateTime(2026, 3, 10, 10, 42, 0),
            TimeTakenMinutes = 42,
        };

        var sub3 = new Submission
        {
            QuizId = quiz1.Id,
            StudentId = "IT23234116",
            StudentName = "Theekshana Nanayakkara",
            StudentAvatar = "TN",
            AvatarColor = "bg-tertiary-fixed",
            AttemptNumber = 1,
            Score = 0,
            TotalMarks = 45,
            Percentage = 0,
            Status = "In Progress",
            StartedAt = new DateTime(2026, 3, 11, 14, 0, 0),
            TimeTakenMinutes = 0,
        };

        var sub4 = new Submission
        {
            QuizId = quiz1.Id,
            StudentId = "IT23228726",
            StudentName = "Sewwandi Dilshani",
            StudentAvatar = "SD",
            AvatarColor = "bg-surface-container-high",
            AttemptNumber = 1,
            Score = 0,
            TotalMarks = 45,
            Percentage = 0,
            Status = "Not Attempted",
            TimeTakenMinutes = 0,
        };

        db.Submissions.AddRange(new[] { sub1, sub2, sub3, sub4 });
        db.SaveChanges();

        // --- create learning resources ---
        var resources = new List<Resource>
        {
            new()
            {
                Title = "Introduction to Data Structures",
                Description = "Comprehensive guide covering arrays, linked lists, stacks and queues.",
                Type = "PDF",
                Url = "https://example.com/dsa-intro.pdf",
                Topic = "Linear Data Structures",
                ModuleId = modules[1].Id,
            },
            new()
            {
                Title = "Binary Tree Visualization",
                Description = "Interactive tool to visualize BST operations like insert, delete and search.",
                Type = "Link",
                Url = "https://visualgo.net/en/bst",
                Topic = "Trees & Binary Trees",
                ModuleId = modules[1].Id,
            },
            new()
            {
                Title = "Graph Algorithms Explained",
                Description = "Video lecture covering BFS, DFS, Dijkstra and Bellman-Ford algorithms.",
                Type = "Video",
                Url = "https://example.com/graph-algorithms",
                Topic = "Graph Algorithms",
                ModuleId = modules[1].Id,
            },
            new()
            {
                Title = "OOP Design Patterns",
                Description = "Article explaining common OOP design patterns with Java examples.",
                Type = "Article",
                Url = "https://example.com/oop-patterns",
                Topic = "OOP Fundamentals",
                ModuleId = modules[0].Id,
            },
        };

        db.Resources.AddRange(resources);
        db.SaveChanges();
    }
}
