//约瑟夫问题
//有ｎ个士兵被敌人围困，他们决定宁死不降，于是围成一圈准备自杀（编号从１到ｎ），从第１号开始报数，一直数到ｍ，数到ｍ的人在别人的监督下自杀，剩下的人再接着从1 开始报数。就这样，直到圈内只剩下一个人时，因为无人监督自杀，这个人选择了投降，编程求输入ｎ，ｍ后，输出最后幸存者编号。
#include <stdio.h>
#include <math.h>
#include <stdlib.h>
//1.循环链表法 O(n*m)
typedef struct Node
{
    int id;
    struct Node *next;
} Node;

void josephus_ring(n, m)
{
    int i = n, j = 1;
    Node *point, *prve;
    Node *ring = (Node *)malloc(sizeof(Node));
    ring->id = 1;
    ring->next = NULL;
    point = ring;
    while (i > 1)
    {
        //printf("j：%d\n", j);
        if (point->next == NULL)
        {
            if (j == n)
            {
                point->next = ring;
                j = 1;
                point = ring;
            }
            else
            {
                Node *ele = (Node *)malloc(sizeof(Node));
                ele->id = j + 1;
                ele->next = NULL;
                point->next = ele;
            }
            //printf("id：%d\n", point->id);
        }
        else
        {
            if (j == m)
            {
                i--;
                j = 0;
                prve->next = point->next;
                printf("kill：%d号\n", point->id);
                free(point);
                point = prve;
            }
        }
        prve = point;
        point = point->next;
        j++;
    }
    printf("幸存者是：%d号\n", point->id);
    free(point);
}
//数学倒推法 O(n)
int josephus_func(n, m)
{
    int s = 0;
    for (int i = 2; i <= n; i++)
    {
        s = (s + m) % i;
        printf("s：%d\n", s);
    }
    printf("幸存者是：%d号\n", s + 1);
}
//还能优化到 O(logn)
//...
int main(void)
{
    josephus_ring(9, 3);
    josephus_func(9, 3);
    return 0;
}