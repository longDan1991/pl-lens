//求最大子列值
#include <stdio.h>
#include <math.h>
#include <time.h>
clock_t start, stop;
double duration;
#define MAXN 10

//T(N)=O(N^2)
double MaxSubseqSum1(int A[], int N)
{
    int ThisSum, MaxSum = 0;
    int i, j, k;
    for (i = 0; i < N; i++)
    {
        ThisSum = 0;
        for (j = 1; j < N; j++)
        {
            ThisSum += A[j];
            if (ThisSum > MaxSum)
                MaxSum = ThisSum;
        }
    }
    return MaxSum;
}
int Max(int a, int b, int c)
{
    if (a > b && a > c)
        return a;
    else if (b > a && b > c)
        return b;
    else
        return c;
}
double Recursion(int A[], int left, int right)
{
    int MaxLeft, MaxRight;
    int MaxLeftRbb, MaxRightRbb;
    int LeftRbb = 0, RightRbb = 0;
    int center, i;
    if (left == right)
        return A[left];
    center = (left + right) / 2;
    MaxLeft = Recursion(A, left, center);
    MaxRight = Recursion(A, center + 1, right);
    //跨边界
    for (i = center; i >= left; i--)
    {
        LeftRbb += A[i];
        if (i + 1 == center || LeftRbb > MaxLeftRbb)
        {
            MaxLeftRbb = LeftRbb;
        }
    }
    for (i = center + 1; i <= right; i++)
    {
        RightRbb += A[i];
        if (i - 1 == center + 1 || RightRbb > MaxRightRbb)
        {
            MaxRightRbb = RightRbb;
        }
    }
    return Max(MaxLeft, MaxRight, MaxLeftRbb + MaxRightRbb);
}
//T(N)=O(N)
double MaxSubseqSum2(int A[], int N)
{
    return Recursion(A, 0, N - 1);
}
int main(int argc, char **argv)
{
    int A[] = { 1, 2, 3, 4, 5, 6 };
    printf("MaxSubseqSum1 = %f\n", MaxSubseqSum1(A,6));
    printf("MaxSubseqSum2 = %f\n", MaxSubseqSum2(A,6));
    return 0;
}