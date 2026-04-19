import { Language } from "./patterns";

export type TestCase = {
  args: unknown[];
  expected: unknown;
  label?: string;
  normalize?: (r: unknown) => unknown; // optional result normalizer before comparison
};

export type Question = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  scenario: string;
  prompt: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: TestCase[];
  functionName: string;
  starterCode: Record<Language, string>;
  solution: Record<Language, string>;
  solutionExplanation: string;
  buildsToward?: string; // id of the medium question this prepares you for
};

const sortArr = (r: unknown) => (Array.isArray(r) ? [...r].sort((a, b) => a - b) : r);

export const QUESTIONS: Question[] = [
  // ── Building blocks for Robot Charge Order ──────────────────────────────
  {
    id: "sort-custom-comparator",
    title: "Sort by a Property",
    difficulty: "easy",
    category: "Sorting",
    buildsToward: "robot-charge-order",
    scenario:
      "You have a leaderboard of players with names and scores. You need to display them in order from lowest score to highest. The input is an array of objects — your job is to sort by the score and return just the names in that order.",
    prompt:
      "Given an array of `{name, score}` objects, return an array of just the names sorted by score ascending.",
    examples: [
      {
        input: `sortByScore([{name:"Alice",score:85},{name:"Bob",score:92},{name:"Carol",score:78}])`,
        output: `["Carol","Alice","Bob"]`,
        explanation: "Carol has lowest score, Bob has highest.",
      },
      {
        input: `sortByScore([{name:"X",score:10},{name:"Y",score:5}])`,
        output: `["Y","X"]`,
      },
    ],
    testCases: [
      {
        args: [[{name:"Alice",score:85},{name:"Bob",score:92},{name:"Carol",score:78}]],
        expected: ["Carol","Alice","Bob"],
      },
      {
        args: [[{name:"X",score:10},{name:"Y",score:5}]],
        expected: ["Y","X"],
      },
      {
        args: [[{name:"Solo",score:50}]],
        expected: ["Solo"],
        label: "single item",
      },
      {
        args: [[{name:"A",score:3},{name:"B",score:1},{name:"C",score:2}]],
        expected: ["B","C","A"],
      },
    ],
    functionName: "sortByScore",
    starterCode: {
      javascript: `function sortByScore(players) {\n  // your code here\n}`,
      python: `def sortByScore(players):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function sortByScore(players) {\n  return players\n    .sort((a, b) => a.score - b.score)\n    .map(p => p.name);\n}`,
      python: `def sortByScore(players):\n    sorted_players = sorted(players, key=lambda p: p['score'])\n    return [p['name'] for p in sorted_players]`,
    },
    solutionExplanation: `Two steps: sort, then extract.\n\nSort takes a comparator function — it gets called with two items (a, b) and returns a negative number if a should come first, positive if b should come first, zero if equal. So \`a.score - b.score\` sorts ascending.\n\nAfter sorting, the objects are in the right order. Now just pull out the names with .map().\n\nThis is the foundation of Robot Charge Order — you sort by one thing (value/score) and return something else (name/index). The key move is that .sort() reorders the original objects, so after sorting you can still access any property on them.`,
  },
  {
    id: "tag-before-sort",
    title: "Tag Before You Sort",
    difficulty: "easy",
    category: "Sorting",
    buildsToward: "robot-charge-order",
    scenario:
      "You have a list of numbers but you need to know where each number originally was after you sort them. If you just sort the array, you lose that information. So before sorting, you need to 'tag' each number with its original position.",
    prompt:
      "Given an array of numbers, return a new array where each element is a pair [value, originalIndex], sorted by value ascending.",
    examples: [
      {
        input: "tagAndSort([40, 10, 30, 20])",
        output: "[[10,1],[20,3],[30,2],[40,0]]",
        explanation: "10 was at index 1, 20 at index 3, etc. Sorted by value, pairs intact.",
      },
      {
        input: "tagAndSort([5, 3, 1])",
        output: "[[1,2],[3,1],[5,0]]",
      },
    ],
    testCases: [
      { args: [[40, 10, 30, 20]], expected: [[10,1],[20,3],[30,2],[40,0]] },
      { args: [[5, 3, 1]], expected: [[1,2],[3,1],[5,0]] },
      { args: [[1]], expected: [[1,0]], label: "single element" },
      { args: [[2, 2, 1]], expected: [[1,2],[2,0],[2,1]] },
    ],
    functionName: "tagAndSort",
    starterCode: {
      javascript: `function tagAndSort(nums) {\n  // your code here\n}`,
      python: `def tagAndSort(nums):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function tagAndSort(nums) {\n  return nums\n    .map((val, idx) => [val, idx])\n    .sort((a, b) => a[0] - b[0]);\n}`,
      python: `def tagAndSort(nums):\n    pairs = [[v, i] for i, v in enumerate(nums)]\n    return sorted(pairs, key=lambda x: x[0])`,
    },
    solutionExplanation: `The problem with sorting a plain array: you lose where things came from.\n\nThe fix: before sorting, pair each value with its index. Now your array has [value, originalIndex] pairs. When you sort by value, the index travels with it — it's attached.\n\nThis is literally the first two steps of Robot Charge Order. Once you have the sorted pairs, Robot Charge Order just does one more step: pull out only the index from each pair. You just built the hard part.`,
  },
  {
    id: "robot-charge-order",
    title: "Robot Charge Order",
    difficulty: "medium",
    category: "Sorting",
    scenario:
      "You're managing a fleet of robots at a charging station. Each robot has a different battery level, stored as a number in an array — but they're not in any order. The charging protocol requires robots be charged from lowest to highest battery. Return the order to charge them as their original positions (indices) in the array, not the sorted values themselves.",
    prompt:
      "Given an array of numbers, return an array of the original indices sorted by their values ascending.",
    examples: [
      {
        input: "chargeOrder([40, 10, 30, 20])",
        output: "[1, 3, 2, 0]",
        explanation:
          "10 is smallest (was at index 1), then 20 (index 3), then 30 (index 2), then 40 (index 0).",
      },
      {
        input: "chargeOrder([5, 3, 1, 4, 2])",
        output: "[2, 4, 1, 3, 0]",
        explanation:
          "1 was at index 2, 2 at index 4, 3 at index 1, 4 at index 3, 5 at index 0.",
      },
    ],
    testCases: [
      { args: [[40, 10, 30, 20]], expected: [1, 3, 2, 0] },
      { args: [[5, 3, 1, 4, 2]], expected: [2, 4, 1, 3, 0] },
      { args: [[1]], expected: [0], label: "single element" },
      { args: [[3, 1, 2]], expected: [1, 2, 0] },
      { args: [[100, 50, 75, 25]], expected: [3, 1, 2, 0] },
    ],
    functionName: "chargeOrder",
    starterCode: {
      javascript: `function chargeOrder(chargers) {\n  // your code here\n}`,
      python: `def chargeOrder(chargers):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function chargeOrder(chargers) {\n  return chargers\n    .map((val, idx) => ({ val, idx }))\n    .sort((a, b) => a.val - b.val)\n    .map(({ idx }) => idx);\n}`,
      python: `def chargeOrder(chargers):\n    indexed = sorted(enumerate(chargers), key=lambda x: x[1])\n    return [i for i, v in indexed]`,
    },
    solutionExplanation: `The key insight: you need to sort by value but return the original indices, not the values themselves.\n\nStep 1 — pair each value with its index so you don't lose track of where it came from.\nStep 2 — sort those pairs by value (ascending).\nStep 3 — pull out just the indices in that sorted order.\n\nIn JS: .map() to pair, .sort() to order, .map() again to extract.\nIn Python: enumerate() gives you index+value pairs, sorted() with a key orders them, then a list comp extracts the indices.`,
  },
  // ── Building blocks for Two Sum ─────────────────────────────────────────
  {
    id: "build-lookup-map",
    title: "Build a Lookup Map",
    difficulty: "easy",
    category: "Arrays",
    buildsToward: "two-sum",
    scenario:
      "You're building a system that needs to find numbers instantly without searching through the whole array every time. The trick: store each number and its position in a map so you can look it up in one step instead of scanning.",
    prompt:
      "Given an array of numbers, return an object where each key is a number from the array and each value is its index.",
    examples: [
      {
        input: "buildMap([2, 7, 11, 15])",
        output: `{"2":0,"7":1,"11":2,"15":3}`,
        explanation: "2 is at index 0, 7 at index 1, etc.",
      },
      {
        input: "buildMap([3, 6, 9])",
        output: `{"3":0,"6":1,"9":2}`,
      },
    ],
    testCases: [
      { args: [[2, 7, 11, 15]], expected: {2:0, 7:1, 11:2, 15:3} },
      { args: [[3, 6, 9]], expected: {3:0, 6:1, 9:2} },
      { args: [[42]], expected: {42:0}, label: "single element" },
      { args: [[5, 1, 3]], expected: {5:0, 1:1, 3:2} },
    ],
    functionName: "buildMap",
    starterCode: {
      javascript: `function buildMap(nums) {\n  // your code here\n}`,
      python: `def buildMap(nums):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function buildMap(nums) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    map[nums[i]] = i;\n  }\n  return map;\n}`,
      python: `def buildMap(nums):\n    return {n: i for i, n in enumerate(nums)}`,
    },
    solutionExplanation: `This is the exact data structure Two Sum uses. You're just building it here as a standalone exercise so it's clear what you're doing and why.\n\nWalking the array once, you store each number as a key and its index as the value. Now instead of searching the array every time you need to find a number (O(n)), you just do map[number] and get the answer instantly (O(1)).\n\nIn Two Sum, this map lets you ask: "have I already seen the number I need?" in one lookup instead of a nested loop.`,
  },
  {
    id: "find-complement",
    title: "Find the Complement",
    difficulty: "easy",
    category: "Arrays",
    buildsToward: "two-sum",
    scenario:
      "Before worrying about indices, just figure out the core question: given a list of numbers, does any pair add up to the target? This forces you to think about what you're actually looking for at each step — and that thinking is exactly what Two Sum needs.",
    prompt:
      "Given an array of numbers and a target, return true if any two different numbers in the array add up to the target, false otherwise.",
    examples: [
      {
        input: "hasPair([2, 7, 11, 15], 9)",
        output: "true",
        explanation: "2 + 7 = 9",
      },
      {
        input: "hasPair([1, 2, 3], 10)",
        output: "false",
        explanation: "No pair adds to 10.",
      },
      {
        input: "hasPair([3, 5, 4], 8)",
        output: "true",
        explanation: "3 + 5 = 8",
      },
    ],
    testCases: [
      { args: [[2, 7, 11, 15], 9], expected: true },
      { args: [[1, 2, 3], 10], expected: false },
      { args: [[3, 5, 4], 8], expected: true },
      { args: [[1, 5, 3, 2], 7], expected: true, label: "5+2=7" },
      { args: [[4, 4], 8], expected: true, label: "same value twice" },
      { args: [[1], 2], expected: false, label: "single element" },
    ],
    functionName: "hasPair",
    starterCode: {
      javascript: `function hasPair(nums, target) {\n  // your code here\n}`,
      python: `def hasPair(nums, target):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function hasPair(nums, target) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(target - n)) return true;\n    seen.add(n);\n  }\n  return false;\n}`,
      python: `def hasPair(nums, target):\n    seen = set()\n    for n in nums:\n        if target - n in seen:\n            return True\n        seen.add(n)\n    return False`,
    },
    solutionExplanation: `The key question to ask yourself at each number: "what would I need to pair with this to hit the target?" That number is always target - current. That's the complement.\n\nSo as you walk the array, keep a set of numbers you've already seen. At each step: is the complement already in that set? If yes, you found a pair. If no, add the current number to the set and keep going.\n\nThis is exactly Two Sum's logic — the only difference is Two Sum also needs you to return the indices, not just true/false. Once you get this working, adding index tracking is one small extra step.`,
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    category: "Arrays",
    scenario:
      "Classic. You have a list of numbers and a target. Find the two numbers that add up to the target and return their indices. You may assume exactly one solution always exists.",
    prompt:
      "Given an array of integers and a target, return the indices of the two numbers that add up to the target.",
    examples: [
      {
        input: "twoSum([2, 7, 11, 15], 9)",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "twoSum([3, 2, 4], 6)",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6",
      },
    ],
    testCases: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], normalize: sortArr },
      { args: [[3, 2, 4], 6], expected: [1, 2], normalize: sortArr },
      { args: [[3, 3], 6], expected: [0, 1], normalize: sortArr },
      { args: [[1, 8, 3, 6], 9], expected: [0, 1], normalize: sortArr, label: "1+8=9" },
      { args: [[4, 5, 2, 7], 9], expected: [0, 3], normalize: sortArr, label: "4+7=9" },
    ],
    functionName: "twoSum",
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // your code here\n}`,
      python: `def twoSum(nums, target):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n}`,
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        complement = target - n\n        if complement in seen:\n            return [seen[complement], i]\n        seen[n] = i`,
    },
    solutionExplanation: `The brute force is two nested loops (O(n²)) — check every pair. That works but is too slow for interviews.\n\nThe optimal approach uses a hash map (O(n)):\n\nAs you walk through the array, for each number ask: "have I already seen the number I need to pair with this?" That needed number is target - current.\n\nIf it's in the map, you found your pair — return both indices.\nIf not, store the current number and its index in the map for future lookups.\n\nYou only need one pass through the array. The map gives you O(1) lookups.`,
  },
  {
    id: "first-unique-char",
    title: "First Unique Character",
    difficulty: "easy",
    category: "Strings",
    scenario:
      "You're building a text validation tool. Given a string, find the first character that appears only once and return its index. If every character repeats, return -1.",
    prompt:
      "Given a string, return the index of the first non-repeating character, or -1 if none exists.",
    examples: [
      {
        input: `firstUniqueChar("leetcode")`,
        output: "0",
        explanation: '"l" appears once and is first.',
      },
      {
        input: `firstUniqueChar("loveleetcode")`,
        output: "2",
        explanation: '"v" is the first character that appears only once.',
      },
      {
        input: `firstUniqueChar("aabb")`,
        output: "-1",
        explanation: "Every character repeats.",
      },
    ],
    testCases: [
      { args: ["leetcode"], expected: 0 },
      { args: ["loveleetcode"], expected: 2 },
      { args: ["aabb"], expected: -1 },
      { args: ["z"], expected: 0, label: "single char" },
      { args: ["aabbcc"], expected: -1 },
      { args: ["abcabc"], expected: -1 },
      { args: ["abac"], expected: 1, label: "b is first unique" },
    ],
    functionName: "firstUniqueChar",
    starterCode: {
      javascript: `function firstUniqueChar(s) {\n  // your code here\n}`,
      python: `def firstUniqueChar(s):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function firstUniqueChar(s) {\n  const count = {};\n  for (const c of s) {\n    count[c] = (count[c] || 0) + 1;\n  }\n  for (let i = 0; i < s.length; i++) {\n    if (count[s[i]] === 1) return i;\n  }\n  return -1;\n}`,
      python: `def firstUniqueChar(s):\n    from collections import Counter\n    count = Counter(s)\n    for i, c in enumerate(s):\n        if count[c] == 1:\n            return i\n    return -1`,
    },
    solutionExplanation: `Two passes, one hash map.\n\nPass 1 — count how many times each character appears. Store in an object/dict.\nPass 2 — walk the string again in order. The first character whose count is exactly 1 is your answer. Return its index.\n\nIf you finish pass 2 without finding one, return -1.\n\nThe order of pass 2 matters — it preserves the original left-to-right order so you always return the earliest unique character, not just any unique character.`,
  },
  // ── Building blocks for Valid Parentheses ───────────────────────────────
  {
    id: "stack-simulation",
    title: "Simulate a Stack",
    difficulty: "easy",
    category: "Stacks",
    buildsToward: "valid-parentheses",
    scenario:
      "A stack is like a pile of plates — you can only add to the top or take from the top. Last in, first out (LIFO). Before using a stack to solve bracket problems, you need to be comfortable with the basic operations: push (add to top) and pop (remove from top).",
    prompt:
      `Given an array of operation strings — either "push:N" (add N to the stack) or "pop" (remove the top item) — simulate the stack and return an array of all the values that were popped, in order.`,
    examples: [
      {
        input: `simulateStack(["push:5","push:3","pop","push:7","pop"])`,
        output: "[3,7]",
        explanation: "Push 5, push 3, pop 3 (top), push 7, pop 7 (top).",
      },
      {
        input: `simulateStack(["push:1","push:2","push:3","pop","pop"])`,
        output: "[3,2]",
        explanation: "Popped 3 then 2 — last in, first out.",
      },
    ],
    testCases: [
      { args: [["push:5","push:3","pop","push:7","pop"]], expected: [3,7] },
      { args: [["push:1","push:2","push:3","pop","pop"]], expected: [3,2] },
      { args: [["push:10","pop"]], expected: [10], label: "push then pop" },
      { args: [["push:1","push:2","pop","push:3","pop","pop"]], expected: [2,3,1] },
    ],
    functionName: "simulateStack",
    starterCode: {
      javascript: `function simulateStack(ops) {\n  // your code here\n}`,
      python: `def simulateStack(ops):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function simulateStack(ops) {\n  const stack = [];\n  const popped = [];\n  for (const op of ops) {\n    if (op.startsWith("push:")) {\n      stack.push(Number(op.split(":")[1]));\n    } else if (op === "pop") {\n      popped.push(stack.pop());\n    }\n  }\n  return popped;\n}`,
      python: `def simulateStack(ops):\n    stack = []\n    popped = []\n    for op in ops:\n        if op.startswith("push:"):\n            stack.append(int(op.split(":")[1]))\n        elif op == "pop":\n            popped.append(stack.pop())\n    return popped`,
    },
    solutionExplanation: `A stack is just an array where you only ever interact with the end.\n\npush → .push() or .append() — add to the end.\npop → .pop() — remove from the end and return it.\n\nThat's it. The LIFO (last in, first out) behavior comes naturally from only touching the end.\n\nIn Valid Parentheses, the stack holds opening brackets you've seen but haven't matched yet. When you hit a closing bracket, you pop the top of the stack to check if it matches. If the most recent unmatched opener isn't the right type — invalid. This exercise builds the muscle memory for that exact pattern.`,
  },
  {
    id: "single-bracket-balance",
    title: "Single Bracket Balance",
    difficulty: "easy",
    category: "Stacks",
    buildsToward: "valid-parentheses",
    scenario:
      "Before handling all three bracket types, just handle one: parentheses. A string of only ( and ) characters is balanced if every ( has a matching ) that comes after it, in the right order. Figure this out first — Valid Parentheses is just this, three times over.",
    prompt:
      "Given a string containing only '(' and ')', return true if it is balanced, false otherwise.",
    examples: [
      { input: `isBalanced("(())")`, output: "true" },
      { input: `isBalanced("(()")`, output: "false", explanation: "One ( is never closed." },
      { input: `isBalanced(")(")`, output: "false", explanation: "Closes before it opens." },
      { input: `isBalanced("")`, output: "true", explanation: "Empty is valid." },
    ],
    testCases: [
      { args: ["(())"], expected: true },
      { args: ["(()"], expected: false },
      { args: [")("], expected: false },
      { args: [""], expected: true, label: "empty" },
      { args: ["()()()"], expected: true },
      { args: ["((()))"], expected: true },
      { args: ["(()"], expected: false },
      { args: ["))"], expected: false },
    ],
    functionName: "isBalanced",
    starterCode: {
      javascript: `function isBalanced(s) {\n  // your code here\n}`,
      python: `def isBalanced(s):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function isBalanced(s) {\n  let count = 0;\n  for (const c of s) {\n    if (c === '(') count++;\n    else if (c === ')') count--;\n    if (count < 0) return false;\n  }\n  return count === 0;\n}`,
      python: `def isBalanced(s):\n    count = 0\n    for c in s:\n        if c == '(':\n            count += 1\n        elif c == ')':\n            count -= 1\n        if count < 0:\n            return False\n    return count == 0`,
    },
    solutionExplanation: `With only one type of bracket, you don't even need a stack — a counter works.\n\nEach ( increments, each ) decrements. Two rules:\n1. If count ever goes negative, a ) appeared before its matching ( — immediately invalid.\n2. At the end, count must be 0. Any leftover means unclosed brackets.\n\nThe \`count < 0\` check is the part people forget. ")()" would pass the final check (count = 0) but it's invalid because the ) came first.\n\nValid Parentheses extends this to three bracket types, which is why it needs a stack instead of a counter — you have to know *which type* of bracket to match, not just that you saw one.`,
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "medium",
    category: "Stacks",
    scenario:
      "You're writing a code linter that checks bracket matching. Given a string containing only '(', ')', '{', '}', '[', ']', determine if the brackets are valid — every opening bracket must be closed by the same type, in the correct order.",
    prompt:
      "Given a string of brackets, return true if it is valid, false otherwise.",
    examples: [
      { input: `isValid("()")`, output: "true" },
      { input: `isValid("()[]{}")`, output: "true" },
      { input: `isValid("(]")`, output: "false" },
      {
        input: `isValid("{[]}")`,
        output: "true",
        explanation: "Nested brackets still valid.",
      },
    ],
    testCases: [
      { args: ["()"], expected: true },
      { args: ["()[]{}"], expected: true },
      { args: ["(]"], expected: false },
      { args: ["{[]}"], expected: true },
      { args: ["([)]"], expected: false },
      { args: ["{"], expected: false, label: "unclosed" },
      { args: [""], expected: true, label: "empty string" },
    ],
    functionName: "isValid",
    starterCode: {
      javascript: `function isValid(s) {\n  // your code here\n}`,
      python: `def isValid(s):\n    # your code here\n    pass`,
    },
    solution: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', ']': '[', '}': '{' };\n  for (const c of s) {\n    if ('([{'.includes(c)) {\n      stack.push(c);\n    } else {\n      if (stack.pop() !== map[c]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def isValid(s):\n    stack = []\n    mapping = {')': '(', ']': '[', '}': '{'}\n    for c in s:\n        if c in '([{':\n            stack.append(c)\n        elif not stack or stack.pop() != mapping[c]:\n            return False\n    return not stack`,
    },
    solutionExplanation: `Classic stack problem.\n\nThe rule: every closing bracket must match the most recently opened bracket. That "most recently opened" part is exactly what a stack gives you.\n\nWalk the string:\n— If it's an opening bracket ( [ { → push it onto the stack.\n— If it's a closing bracket ) ] } → pop the top of the stack and check if it matches. If it doesn't, return false immediately.\n\nAt the end, the stack should be empty. If there's anything left, some bracket was never closed.\n\nThe map object is just a lookup: closing bracket → what its matching opener should be.`,
  },
];

export const QUESTION_CATEGORIES = [...new Set(QUESTIONS.map((q) => q.category))];
