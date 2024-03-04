#if !defined(TEST_H)
#define TEST_H
#include <iostream>

class Test
{
public:
    Test();
    Test(int a, int b);
    //Test &operator=(const Test &other);
    inline Test(int a, int b, int c) { cout << "inline constructor" << endl; };
    ~Test();
    void print();
    int getA() const;
    int getB() const;
    unsigned int add(int a, int b);
    unsigned int *add(int a, int b, int c);
    double &add(int a, int b, int c, int d);
    void methodConst() const;
    unsigned int *methodReturnPointer();
    double methodOverload(int a);
    double methodOverload(int a, int b);
    unsigned int methodVirtual(int b);

    virtual unsigned int methodVirtual();
    inline void methodInline() { cout << "inline method" << endl; };

private:
    int a;
    int b;
};
#endif // TEST_H
