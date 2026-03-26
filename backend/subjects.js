const subjects = {
    dataStructures: {
        name: "Data Structures",
        topics: ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Hash Tables", "Heaps"],
        concepts: {
            arrays: {
                title: "Arrays",
                explanation: "An array is a collection of items stored at contiguous memory locations. Elements can be accessed randomly using indices.",
                keyPoints: [
                    "Fixed size (in most languages)",
                    "O(1) access time",
                    "O(n) insertion/deletion in worst case",
                    "Cache-friendly due to contiguous memory"
                ],
                examples: ["int arr[5] = {1, 2, 3, 4, 5};"]
            },
            linkedLists: {
                title: "Linked Lists",
                explanation: "A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node in the sequence.",
                keyPoints: [
                    "Dynamic size",
                    "O(n) access time",
                    "O(1) insertion/deletion at known position",
                    "Types: Singly, Doubly, Circular"
                ],
                examples: ["Node: [data | next] -> [data | next] -> null"]
            },
            stacks: {
                title: "Stacks",
                explanation: "A stack is a LIFO (Last In First Out) data structure. Elements are added and removed from the same end (top).",
                keyPoints: [
                    "LIFO principle",
                    "Operations: push, pop, peek",
                    "O(1) for all operations",
                    "Used in: function calls, undo operations, expression evaluation"
                ],
                examples: ["Push: [1] -> [1,2] -> [1,2,3]", "Pop: [1,2,3] -> [1,2]"]
            },
            queues: {
                title: "Queues",
                explanation: "A queue is a FIFO (First In First Out) data structure. Elements are added at rear and removed from front.",
                keyPoints: [
                    "FIFO principle",
                    "Operations: enqueue, dequeue, front",
                    "O(1) for all operations",
                    "Used in: BFS, scheduling, buffering"
                ],
                examples: ["Enqueue: [1] -> [1,2] -> [1,2,3]", "Dequeue: [1,2,3] -> [2,3]"]
            },
            trees: {
                title: "Trees",
                explanation: "A tree is a hierarchical data structure with a root node and subtrees of children nodes. Each node has zero or more child nodes.",
                keyPoints: [
                    "Non-linear structure",
                    "Types: Binary, BST, AVL, Red-Black",
                    "Traversals: Inorder, Preorder, Postorder",
                    "Used in: databases, file systems"
                ],
                examples: ["Binary Tree: Root -> Left subtree, Right subtree"]
            },
            graphs: {
                title: "Graphs",
                explanation: "A graph is a collection of vertices (nodes) connected by edges. Can be directed or undirected.",
                keyPoints: [
                    "Vertices and Edges",
                    "Directed vs Undirected",
                    "Weighted vs Unweighted",
                    "Representations: Adjacency Matrix, Adjacency List"
                ],
                examples: ["Social network: Users as vertices, friendships as edges"]
            }
        },
        quizQuestions: [
            {
                question: "What is the time complexity of accessing an element in an array by index?",
                options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
                correct: 0,
                explanation: "Arrays provide constant time O(1) access because elements are stored in contiguous memory locations."
            },
            {
                question: "Which data structure follows LIFO principle?",
                options: ["Queue", "Stack", "Array", "Linked List"],
                correct: 1,
                explanation: "Stack follows Last In First Out (LIFO) - the last element added is the first one removed."
            },
            {
                question: "What is the worst-case time complexity for searching in a Binary Search Tree?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                correct: 2,
                explanation: "In a skewed BST (essentially a linked list), search becomes O(n)."
            },
            {
                question: "Which traversal visits nodes in Left-Root-Right order?",
                options: ["Preorder", "Inorder", "Postorder", "Level order"],
                correct: 1,
                explanation: "Inorder traversal visits left subtree, then root, then right subtree."
            },
            {
                question: "What data structure is best for implementing BFS?",
                options: ["Stack", "Queue", "Array", "Heap"],
                correct: 1,
                explanation: "BFS uses a queue to explore nodes level by level."
            }
        ]
    },
    operatingSystems: {
        name: "Operating Systems",
        topics: ["Process Management", "Memory Management", "File Systems", "CPU Scheduling", "Deadlocks", "Synchronization"],
        concepts: {
            processes: {
                title: "Processes",
                explanation: "A process is an instance of a program in execution. It includes the program code, current activity, and allocated resources.",
                keyPoints: [
                    "States: New, Ready, Running, Waiting, Terminated",
                    "Process Control Block (PCB) stores process info",
                    "Context switching between processes",
                    "Process vs Thread"
                ],
                examples: ["Opening Chrome creates a new process"]
            },
            scheduling: {
                title: "CPU Scheduling",
                explanation: "CPU scheduling determines which process runs on the CPU at any given time. Goal is to maximize CPU utilization and throughput.",
                keyPoints: [
                    "FCFS, SJF, Priority, Round Robin",
                    "Preemptive vs Non-preemptive",
                    "Metrics: Turnaround time, Waiting time",
                    "Context switch overhead"
                ],
                examples: ["Round Robin with quantum = 4ms"]
            },
            deadlocks: {
                title: "Deadlocks",
                explanation: "A deadlock occurs when processes are waiting for resources held by each other, creating a circular wait.",
                keyPoints: [
                    "4 conditions: Mutual exclusion, Hold and wait, No preemption, Circular wait",
                    "Prevention, Avoidance, Detection, Recovery",
                    "Banker's Algorithm for avoidance",
                    "Resource Allocation Graph"
                ],
                examples: ["Process A holds R1, waits for R2; Process B holds R2, waits for R1"]
            },
            memory: {
                title: "Memory Management",
                explanation: "Memory management handles allocation and deallocation of memory to processes, and manages virtual memory.",
                keyPoints: [
                    "Paging and Segmentation",
                    "Virtual Memory",
                    "Page Replacement: FIFO, LRU, Optimal",
                    "Thrashing"
                ],
                examples: ["Page fault triggers loading from disk to RAM"]
            },
            synchronization: {
                title: "Process Synchronization",
                explanation: "Synchronization ensures orderly execution of cooperating processes that share data or resources.",
                keyPoints: [
                    "Critical Section Problem",
                    "Mutex, Semaphores, Monitors",
                    "Peterson's Solution",
                    "Producer-Consumer, Reader-Writer problems"
                ],
                examples: ["Semaphore wait() and signal() operations"]
            }
        },
        quizQuestions: [
            {
                question: "Which scheduling algorithm can cause starvation?",
                options: ["FCFS", "Round Robin", "Priority Scheduling", "None"],
                correct: 2,
                explanation: "Priority scheduling can cause starvation if low-priority processes never get CPU time."
            },
            {
                question: "How many conditions are required for a deadlock?",
                options: ["2", "3", "4", "5"],
                correct: 2,
                explanation: "Four conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait."
            },
            {
                question: "Which page replacement algorithm is optimal but impractical?",
                options: ["FIFO", "LRU", "Optimal", "Clock"],
                correct: 2,
                explanation: "Optimal algorithm requires future knowledge of page references, which is impossible in practice."
            },
            {
                question: "What does PCB stand for?",
                options: ["Program Control Block", "Process Control Block", "Primary Control Block", "Processor Control Block"],
                correct: 1,
                explanation: "Process Control Block stores all information about a process."
            },
            {
                question: "Which is NOT a process state?",
                options: ["Ready", "Running", "Sleeping", "Waiting"],
                correct: 2,
                explanation: "Standard states are: New, Ready, Running, Waiting, Terminated. 'Sleeping' is not a standard term."
            }
        ]
    },
    dbms: {
        name: "Database Management Systems",
        topics: ["SQL", "Normalization", "Transactions", "Indexing", "ER Diagrams", "ACID Properties"],
        concepts: {
            normalization: {
                title: "Normalization",
                explanation: "Normalization is the process of organizing data to minimize redundancy and dependency.",
                keyPoints: [
                    "1NF: Atomic values, no repeating groups",
                    "2NF: 1NF + No partial dependencies",
                    "3NF: 2NF + No transitive dependencies",
                    "BCNF: Stricter version of 3NF"
                ],
                examples: ["Splitting a table with redundant data into related tables"]
            },
            acid: {
                title: "ACID Properties",
                explanation: "ACID properties ensure reliable database transactions.",
                keyPoints: [
                    "Atomicity: All or nothing",
                    "Consistency: Valid state to valid state",
                    "Isolation: Concurrent transactions don't interfere",
                    "Durability: Committed changes persist"
                ],
                examples: ["Bank transfer: debit and credit must both succeed or both fail"]
            },
            indexing: {
                title: "Indexing",
                explanation: "Indexes are data structures that improve query performance by providing quick data lookup.",
                keyPoints: [
                    "B-Tree, B+ Tree indexes",
                    "Hash indexes",
                    "Clustered vs Non-clustered",
                    "Trade-off: Faster reads, slower writes"
                ],
                examples: ["CREATE INDEX idx_name ON users(name);"]
            }
        },
        quizQuestions: [
            {
                question: "Which normal form removes transitive dependencies?",
                options: ["1NF", "2NF", "3NF", "BCNF"],
                correct: 2,
                explanation: "3NF eliminates transitive dependencies where non-key attributes depend on other non-key attributes."
            },
            {
                question: "What does 'A' in ACID stand for?",
                options: ["Availability", "Atomicity", "Accuracy", "Authentication"],
                correct: 1,
                explanation: "Atomicity ensures transactions are all-or-nothing."
            },
            {
                question: "Which index type is best for equality searches?",
                options: ["B-Tree", "Hash", "Bitmap", "Full-text"],
                correct: 1,
                explanation: "Hash indexes provide O(1) lookup for exact match queries."
            }
        ]
    },
    computerNetworks: {
        name: "Computer Networks",
        topics: ["OSI Model", "TCP/IP", "HTTP/HTTPS", "DNS", "Routing", "Network Security"],
        concepts: {
            osi: {
                title: "OSI Model",
                explanation: "The OSI model is a conceptual framework with 7 layers that standardizes network communication.",
                keyPoints: [
                    "Physical, Data Link, Network, Transport, Session, Presentation, Application",
                    "Each layer has specific functions",
                    "Data encapsulation at each layer",
                    "Mnemonic: Please Do Not Throw Sausage Pizza Away"
                ],
                examples: ["HTTP at Application layer, TCP at Transport layer"]
            },
            tcpip: {
                title: "TCP vs UDP",
                explanation: "TCP and UDP are transport layer protocols with different characteristics.",
                keyPoints: [
                    "TCP: Reliable, connection-oriented, ordered",
                    "UDP: Unreliable, connectionless, faster",
                    "TCP uses handshake, acknowledgments",
                    "UDP used for streaming, gaming"
                ],
                examples: ["Web browsing uses TCP; Video streaming often uses UDP"]
            },
            dns: {
                title: "DNS",
                explanation: "Domain Name System translates human-readable domain names to IP addresses.",
                keyPoints: [
                    "Hierarchical structure",
                    "Root, TLD, Authoritative servers",
                    "Caching for performance",
                    "DNS records: A, AAAA, CNAME, MX"
                ],
                examples: ["google.com -> 142.250.190.46"]
            }
        },
        quizQuestions: [
            {
                question: "How many layers are in the OSI model?",
                options: ["4", "5", "6", "7"],
                correct: 3,
                explanation: "OSI model has 7 layers from Physical to Application."
            },
            {
                question: "Which protocol is connectionless?",
                options: ["TCP", "UDP", "HTTP", "FTP"],
                correct: 1,
                explanation: "UDP is connectionless - it doesn't establish a connection before sending data."
            },
            {
                question: "What does DNS primarily do?",
                options: ["Encrypt data", "Resolve domain names", "Route packets", "Filter traffic"],
                correct: 1,
                explanation: "DNS resolves domain names to IP addresses."
            }
        ]
    }
};

module.exports = subjects;
