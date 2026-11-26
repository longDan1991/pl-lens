//计算给定多项式在给定x处的值
#include <stdio.h>
#include <math.h>
#include <time.h>
clock_t start, stop;
double duration;
#define MAXN 10

//f(x)=a0+a1x+...+an-1xn-1+anxn
//(1+2+...+n)=(n2+n)/2次乘法 => O(n2)
double f1(int n, double a[], double x)
{
    int i;
    double p = a[0];
    for (i = 1; i <= n; i++)
    {
        p += (a[i] * pow(x, i));
    }
    return p;
}
//f(x)=a0+x(a1+x(...(an-1+x(an))...))
//n次乘法 => O(n)
double f2(int n, double a[], double x)
{
    int i;
    double p = a[n];
    for (i = n; i > 0; i--)
    {
        p = a[i - 1] + x * p;
    }
    return p;
}
int main(int argc, char **argv)
{
    int i;
    double a[MAXN];
    for (i = 0; i < MAXN; i++)
        a[i] = (double)i;

    start = clock();
    f1(MAXN - 1, a, 1.1);
    stop = clock();
    //duration = ((double)(stop - start)) / CLK_TCK;
    printf("ticks1 = %f\n", (double)(stop - start));
    //printf("duration1 = %6.2e\n", duration);

    start = clock();
    f2(MAXN - 1, a, 1.1);
    stop = clock();
    //duration = ((double)(stop - start)) / CLK_TCK;
    printf("ticks1 = %f\n", (double)(stop - start));
    //printf("duration1 = %6.2e\n", duration);
    return 0;
}