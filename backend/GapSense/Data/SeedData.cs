using GapSense.Models.Entities;

namespace GapSense.Data;

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
    }
}
