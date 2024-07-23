/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('To-Do List', () => {
    let mainJs, inputField, addButton, taskList;

    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, './todo.html'), 'utf8');
        document.body.innerHTML = html;

        // Re-import the main.js file after setting up the DOM
        jest.resetModules();
        mainJs = require('./sum.js');

        error = document.querySelector(".events");
        inputField = document.querySelector('#inputfield');
        addButton = document.querySelector('.addbutton');
        taskList = document.querySelector('#taskList');

        // Mock localStorage
        const mockLocalStorage = (() => {
            let store = {};
            return {
                getItem: (key) => store[key] || null,
                setItem: (key, value) => (store[key] = value.toString()),
                clear: () => (store = {}),
                removeItem: (key) => delete store[key],
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
        });

        // Clear any previous tasks
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });
    
    test('should correctly select inputField element', () => {
      expect(inputField).not.toBeNull();
      expect(inputField.id).toBe('inputfield');
    });

    test('should correctly select taskList element', () => {
      expect(taskList).not.toBeNull();
      expect(taskList.tagName).toBe('OL'); // Changed to UL based on standard usage
    });

    test('should add a single task, save it to localStorage, and render it correctly', () => {
        inputField.value = 'Task 1';
        addButton.click();

        const tasks = document.querySelectorAll('#taskList li');
        expect(tasks.length).toBe(1);
        expect(tasks[0].textContent).toContain('Task 1');
        expect(localStorage.getItem('todoArrayList')).toContain('Task 1');
        expect(error.style.visibility).toBe('visible');
        expect(error.textContent).toBe('Task added successfully!');
    });

    test('should display an error message for empty input', () => {
      inputField.value = '';
      addButton.click();
  
      // Verify error message
      expect(error.style.visibility).toBe('visible');
      expect(error.textContent).toBe('Invalid input. Please enter a task.');
    });

    test('should add two tasks and render both correctly', () => {
        inputField.value = 'Task 1';
        addButton.click();
        
        inputField.value = 'Task 2';
        addButton.click();
        const savedTasks = JSON.parse(localStorage.getItem('todoArrayList'));
        expect(savedTasks.length).toBe(2);
        expect(savedTasks[0].taskName).toBe('Task 1');
        expect(savedTasks[1].taskName).toBe('Task 2');
    });
});
