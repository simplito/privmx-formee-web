'use client';

import { Sheet } from '@atoms/sheet';
import { Paper, Grid, GridCol, Text, Stack, Skeleton, Tooltip } from '@mantine/core';
import { FormStatus } from '@utils/types';
import { InboxResponse } from '../../data';
import { FormAnswer } from './FormAnswer/FormAnswer';

export function FormAnswers({
    responses,
    status
}: {
    responses: InboxResponse[];
    status: FormStatus;
}) {
    if (status === 'loading') {
        return (
            <Sheet w="100%" h="100%" p="md" flex={1}>
                <Paper p="xs" bg="gray.0" mb="xs">
                    <Skeleton>
                        <Text size="xs">Placeholder</Text>
                    </Skeleton>
                </Paper>
                <Stack>
                    <Skeleton p="sm" w="100%" height={36.3} />
                    <Skeleton p="sm" w="100%" height={36.3} />
                    <Skeleton p="sm" w="100%" height={36.3} />
                    <Skeleton p="sm" w="100%" height={36.3} />
                </Stack>
            </Sheet>
        );
    }
    const questions = extractQuestionAnswers(responses);

    return (
        <Sheet w="100%" h="100%" p="md" flex={1}>
            <Paper p="xs" bg="gray.0" mb="xs">
                <Grid columns={questions.length}>
                    {questions.map((question, i) => (
                        <GridCol key={i} span={1}>
                            <Tooltip label={question} openDelay={800}>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                    {question}
                                </Text>
                            </Tooltip>
                        </GridCol>
                    ))}
                </Grid>
            </Paper>
            <Stack>
                {responses.map((a) => (
                    <FormAnswer
                        questions={questions}
                        key={a.questions[0].id}
                        row={a}
                        responseId={a.id}
                    />
                ))}
            </Stack>
        </Sheet>
    );
}

function extractQuestionAnswers(responses: InboxResponse[]): string[] {
    const sortedResponses = responses
        .sort((a, b) => b.createDate - a.createDate)
        .map((x) => x.questions.map((question) => question.name));
    const answersSet: string[] = [];

    const maxResponseQuestionCount = sortedResponses
        .map((x) => x.length)
        .sort()
        .at(-1);

    for (let i = 0; i < maxResponseQuestionCount; i++) {
        for (let j = 0; j < sortedResponses.length; j++) {
            const question = sortedResponses[j].at(i);
            if (
                question &&
                !answersSet.find(
                    (answer) => answer.toLocaleLowerCase() == question.toLocaleLowerCase()
                )
            ) {
                answersSet.push(question);
            }
        }
    }

    return Array.from(answersSet.values());
}
