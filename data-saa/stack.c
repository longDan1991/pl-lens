//栈
#include <stdio.h>
#include <stdlib.h>
#define STACK_SIZE 100    //栈初始大小
#define STACKINCREMENT 10 //空间分配增量
typedef int ElemType;

typedef struct Stack
{
    ElemType *bottom;
    ElemType *top;
    int stacksize; //当前已分空间，以元素为单位
} Stack;

//动态栈 ?内存地址的计算很模糊
//栈的初始化
Stack init_stack()
{
    Stack S;
    S.bottom = (ElemType *)malloc(STACK_SIZE * sizeof(ElemType));
    // if (!S.bottom)
    //     return NULL;
    S.top = S.bottom;
    S.stacksize = STACK_SIZE;
    return S;
}
//压栈
Stack push_stack(Stack S, ElemType e)
{
    if (S.top - S.bottom >= S.stacksize - 1)
    {
        S.bottom = (ElemType *)realloc(S.bottom, (STACKINCREMENT + STACK_SIZE) * sizeof(ElemType));
        S.top = S.bottom + S.stacksize;
        S.stacksize += STACKINCREMENT;
        printf("新增内存！");
    }
    *S.top = e; //?
    S.top++;
    return S;
}
//静态栈
//...
//链栈
//...
//栈的应用
//十进制整数N向其他进制数d（二、八、十六）的转换。
//中缀求值 后缀求值 中缀转后缀

int main(void)
{
    Stack s = init_stack();
    push_stack(s, 100);
    return 0;
}