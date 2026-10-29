#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <limits>
using namespace std;

void showMenu() {
    cout << "\n=== C++ Console Toolkit ===\n"
         << "1. Analyze an array\n"
         << "2. Print a matrix\n"
         << "3. Sort numbers\n"
         << "0. Exit\n"
         << "Choose: ";
}

int main() {
    int choice;
    do {
        showMenu();
        if (!(cin >> choice)) return 0;
        if (choice == 1) {
            int n;
            cout << "Number of elements: ";
            if (!(cin >> n) || n <= 0 || n > 10000) {
                cout << "Enter a number from 1 to 10000.\n";
                cin.clear(); cin.ignore(numeric_limits<streamsize>::max(), '\n');
                continue;
            }
            vector<double> values(n);
            for (int i = 0; i < n; ++i) {
                cout << "Value " << i + 1 << ": ";
                cin >> values[i];
            }
            auto [minIt, maxIt] = minmax_element(values.begin(), values.end());
            double sum = accumulate(values.begin(), values.end(), 0.0);
            cout << "Minimum: " << *minIt << "\nMaximum: " << *maxIt
                 << "\nAverage: " << sum / values.size() << "\n";
        } else if (choice == 2) {
            int rows, cols;
            cout << "Rows and columns (1-20): ";
            if (!(cin >> rows >> cols) || rows < 1 || rows > 20 || cols < 1 || cols > 20) {
                cout << "Invalid matrix size.\n";
                cin.clear(); cin.ignore(numeric_limits<streamsize>::max(), '\n');
                continue;
            }
            for (int r = 0; r < rows; ++r) {
                for (int c = 0; c < cols; ++c) cout << (r * cols + c + 1) << "\t";
                cout << "\n";
            }
        } else if (choice == 3) {
            int n;
            cout << "Number of values (1-10000): ";
            if (!(cin >> n) || n < 1 || n > 10000) {
                cout << "Invalid count.\n";
                cin.clear(); cin.ignore(numeric_limits<streamsize>::max(), '\n');
                continue;
            }
            vector<double> values(n);
            for (double &value : values) cin >> value;
            sort(values.begin(), values.end());
            cout << "Sorted: ";
            for (double value : values) cout << value << " ";
            cout << "\n";
        } else if (choice != 0) {
            cout << "Unknown option. Try again.\n";
        }
    } while (choice != 0);
    cout << "Goodbye!\n";
    return 0;
}